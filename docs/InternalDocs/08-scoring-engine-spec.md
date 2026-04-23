# TicketIQ — 08. Scoring Engine Specification

> **Domain-Adaptive Priority Engine — Technical Specification**

| Property | Value |
|---|---|
| Document ID | 08-scoring-engine-spec |
| Version | 1.0.0 |
| Engine File | `services/priorityEngine.js` |
| Date | March 2026 |

---

## 1. Overview

The Scoring Engine (Priority Engine) is the **core intelligence** of TicketIQ. It automatically determines the urgency of incoming support tickets by scanning their text content against domain-specific keyword rules stored in the database.

### Key Principle

> The system should **never under-prioritize** a critical ticket. If the engine detects a higher priority than what the user selected, the system overrides upward. The user's priority is never downgraded.

---

## 2. Priority Ranking System

```js
const PRIORITY_RANK = {
  critical : 4,   // Highest — immediate attention required
  high     : 3,   // Urgent — resolve within hours
  medium   : 2,   // Standard — resolve within a day
  low      : 1    // Minor — resolve within days
};
```

### Priority Comparison Rule

```
finalPriority = max(systemPriority, userPriority)
```

| User Selects | Engine Detects | Final Priority | Reason |
|---|---|---|---|
| LOW | CRITICAL | **CRITICAL** | System overrides (higher) |
| MEDIUM | HIGH | **HIGH** | System overrides (higher) |
| HIGH | LOW | **HIGH** | User priority kept (higher) |
| CRITICAL | MEDIUM | **CRITICAL** | User priority kept (higher) |
| MEDIUM | — (no match) | **MEDIUM** | Default to user's choice |

---

## 3. Engine Architecture

```
POST /api/tickets (Ticket Created)
        │
        ▼
ticketController.createTicket()
        │
        ▼
priorityEngine.assignPriority(ticketData, tenantId)
        │
        ├── Step 1: Load domain rules from DB
        │     Domain.findOne({ tenantId, name: ticket.domain })
        │
        ├── Step 2: Normalize ticket text
        │     text = (title + " " + description).toLowerCase()
        │
        ├── Step 3: Iterate through rules
        │     For each rule → split comma-separated keywords
        │     For each keyword → check if text.includes(keyword)
        │
        ├── Step 4: Track highest matching priority
        │     systemPriority = max(all matched rule priorities)
        │
        ├── Step 5: Compare with userPriority
        │     finalPriority = max(systemPriority, userPriority)
        │
        └── Return { systemPriority, finalPriority }
```

---

## 4. Full Implementation

```js
// services/priorityEngine.js

const Domain = require('../models/Domain');

const PRIORITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 };

const assignPriority = async (ticketData, tenantId) => {
  try {
    // Step 1: Load domain rules
    const domain = await Domain.findOne({
      tenantId,
      name: ticketData.domain
    });

    // No rules configured — fallback to user's priority
    if (!domain || !domain.rules.length) {
      return {
        systemPriority: ticketData.userPriority,
        finalPriority: ticketData.userPriority
      };
    }

    // Step 2: Normalize text
    const text = `${ticketData.title} ${ticketData.description}`.toLowerCase();

    let systemPriority = 'low';

    // Step 3: Scan each rule
    for (const rule of domain.rules) {
      const keywords = rule.keyword
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);

      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          if (PRIORITY_RANK[rule.priority] > PRIORITY_RANK[systemPriority]) {
            systemPriority = rule.priority;
          }
          break; // matched this rule, move to next
        }
      }

      // Short-circuit: already at highest possible
      if (systemPriority === 'critical') break;
    }

    // Step 5: Final priority = higher of system vs user
    const finalPriority =
      PRIORITY_RANK[systemPriority] >= PRIORITY_RANK[ticketData.userPriority]
        ? systemPriority
        : ticketData.userPriority;

    return { systemPriority, finalPriority };

  } catch (err) {
    console.error('Priority engine error:', err.message);
    // Fallback: never fail ticket creation
    return {
      systemPriority: ticketData.userPriority,
      finalPriority: ticketData.userPriority
    };
  }
};

module.exports = { assignPriority };
```

---

## 5. Keyword Matching Rules

### Matching Behavior

| Rule | Behavior |
|---|---|
| Case sensitivity | Case-insensitive (all lowercased) |
| Match type | Substring match (`text.includes(keyword)`) |
| Multiple keywords | Comma-separated in one rule, any match triggers |
| Multiple rules match | Highest priority wins |
| No rules match | systemPriority defaults to `'low'`, finalPriority = userPriority |
| Cross-domain | Rules are domain-specific; banking rules don't fire for edtech |

### Keyword Format

```
Single keyword:    "payment failed"
Multiple keywords: "payment failed, transaction failed, payment declined"
```

---

## 6. Default Seed Rules by Domain

### Banking

| Keywords | Priority |
|---|---|
| payment failed, transaction failed, payment declined | CRITICAL |
| account locked, account suspended, unauthorized access | CRITICAL |
| money deducted, amount deducted, double charge | CRITICAL |
| wrong balance, missing funds, balance incorrect | HIGH |
| cannot login, login failed, access denied | HIGH |
| card blocked, card declined | HIGH |
| statement incorrect, wrong statement | MEDIUM |
| change address, update details, update email | LOW |

### E-Commerce

| Keywords | Priority |
|---|---|
| order not delivered, package missing, never arrived | HIGH |
| refund not received, money not refunded, refund stuck | HIGH |
| payment stuck, payment pending, charged not delivered | HIGH |
| wrong item, incorrect product, damaged product | MEDIUM |
| late delivery, delivery delayed | MEDIUM |
| cancel order, order cancellation | MEDIUM |
| change address, update order | LOW |
| track order, where is my order | LOW |

### Healthcare

| Keywords | Priority |
|---|---|
| system down, portal not loading, cannot access, server error | CRITICAL |
| patient data missing, records not found, data lost | CRITICAL |
| appointment not confirmed, booking failed | HIGH |
| prescription not available, medicine not found | HIGH |
| billing error, invoice wrong, charge incorrect | MEDIUM |
| report not available, test result missing | MEDIUM |
| update profile, change doctor | LOW |

### EdTech

| Keywords | Priority |
|---|---|
| exam portal down, cannot submit exam, submission failed | CRITICAL |
| quiz not saving, answers lost, exam crashed | CRITICAL |
| certificate not received, certificate missing | HIGH |
| payment not confirmed, enrollment failed | HIGH |
| video not loading, lecture not playing | MEDIUM |
| assignment not submitted, upload failed | MEDIUM |
| course not visible, content missing | MEDIUM |
| change password, update profile | LOW |

---

## 7. Integration with Ticket Controller

```js
// controllers/ticketController.js

const { assignPriority } = require('../services/priorityEngine');

const createTicket = async (req, res) => {
  const { title, description, category, userPriority } = req.body;
  const { tenantId, domain, _id: createdBy } = req.user;

  // Run priority engine
  const { systemPriority, finalPriority } = await assignPriority(
    { title, description, domain, userPriority },
    tenantId
  );

  // Calculate SLA deadline based on finalPriority
  const slaPolicy = await SLAPolicy.findOne({ tenantId, domain, priority: finalPriority });
  const slaDeadline = new Date(Date.now() + slaPolicy.resolutionTimeMin * 60 * 1000);

  // Generate ticket number
  const ticketNumber = await generateTicketNumber(tenantId);

  // Create ticket
  const ticket = await Ticket.create({
    tenantId, ticketNumber, title, description,
    category, domain, userPriority, systemPriority,
    finalPriority, slaDeadline, createdBy, status: 'open'
  });

  return success(res, ticket, 'Ticket created successfully', 201);
};
```

---

## 8. Edge Cases & Fallbacks

| Scenario | Behavior |
|---|---|
| No domain rules configured | finalPriority = userPriority |
| Domain record not found | finalPriority = userPriority |
| Engine throws error | finalPriority = userPriority (ticket still created) |
| Empty title/description | No keywords match → userPriority used |
| Keyword appears in both title and description | Matches once, no double-counting |
| Already at CRITICAL | Engine short-circuits, skips remaining rules |

---

## 9. Performance Considerations

| Aspect | Design Choice |
|---|---|
| Rule loading | Single DB query per ticket creation |
| Keyword matching | Simple `string.includes()` — O(n×m) |
| Short-circuit | Breaks loop when CRITICAL is found |
| Caching | Not implemented in MVP (rules change infrequently) |
| Scalability | Adequate for hundreds of rules per domain |

---

*TicketIQ © 2026 — Software Engineering Subject Project*
