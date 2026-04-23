# TicketIQ — 02. User Stories & Acceptance Criteria

> **Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document ID | 02-user-stories-and-acceptance-criteria |
| Version | 1.0.0 |
| Total User Stories | 25 |
| Date | March 2026 |

---

## 1. Customer User Stories

### US-C01: Account Registration

**As a** customer, **I want to** register an account with my name, email, password, and business domain, **so that** I can submit support tickets.

**Acceptance Criteria:**

- [ ] Registration form validates name (required), email (valid format, unique), password (min 8 chars)
- [ ] Customer selects a business domain during registration (Banking, E-Commerce, Healthcare, EdTech)
- [ ] On successful registration, user receives a JWT token and is redirected to the customer dashboard
- [ ] Duplicate email returns a clear error: "Email already registered"
- [ ] All form fields show inline validation errors
- [ ] Password is stored hashed (bcrypt, 12 rounds) — never in plain text

---

### US-C02: Login

**As a** customer, **I want to** log in with my email and password, **so that** I can access my support dashboard.

**Acceptance Criteria:**

- [ ] User can log in with email and password
- [ ] Invalid credentials return "Invalid email or password" error
- [ ] JWT token is issued and stored in httpOnly cookie
- [ ] User is redirected to `/customer/dashboard` on success
- [ ] Token expires after 7 days, forcing re-login

---

### US-C03: Submit Support Ticket

**As a** customer, **I want to** submit a ticket with title, description, category, and my chosen priority, **so that** I can report an issue.

**Acceptance Criteria:**

- [ ] Submit form requires: title (required, max 200 chars), description (required, max 2000 chars), category, userPriority
- [ ] System auto-generates a unique ticket number (e.g., TKT-00042)
- [ ] System runs the priority engine → systemPriority is assigned
- [ ] If systemPriority > userPriority, finalPriority is overridden with a visible message: "System upgraded your priority to CRITICAL"
- [ ] slaDeadline is calculated based on finalPriority's SLA policy
- [ ] Ticket appears in the customer's dashboard immediately after creation
- [ ] Empty title or description shows inline validation error

---

### US-C04: View System-Assigned Priority

**As a** customer, **I want to** see the system-assigned priority on my ticket, **so that** I understand its urgency level.

**Acceptance Criteria:**

- [ ] Ticket detail page shows both userPriority and finalPriority
- [ ] If system overrode priority, a clear message is displayed
- [ ] Priority is shown as a color-coded badge (CRITICAL=red, HIGH=orange, MEDIUM=blue, LOW=green)

---

### US-C05: View My Tickets

**As a** customer, **I want to** view all my submitted tickets, **so that** I can track their status.

**Acceptance Criteria:**

- [ ] Customer sees only their own tickets (data isolation enforced)
- [ ] Ticket list shows: Ticket Number, Title, Priority Badge, Status Badge, SLA Timer, Created Date
- [ ] List is sortable by priority, status, and date
- [ ] Customer can filter by status (Open, In Progress, Resolved)

---

### US-C06: View SLA Deadline

**As a** customer, **I want to** see the SLA deadline on my ticket, **so that** I know when it should be resolved.

**Acceptance Criteria:**

- [ ] SLA ring timer is visible on each ticket in the list and detail views
- [ ] Timer color changes: green (safe) → orange (warning, < 2h) → red (critical, < 30min)
- [ ] If SLA is breached, badge shows "BREACHED" in red

---

### US-C07: Add Comments

**As a** customer, **I want to** add comments on my ticket, **so that** I can provide additional information.

**Acceptance Criteria:**

- [ ] Comment input is available on the ticket detail page
- [ ] Comments show author name, message, and timestamp
- [ ] Empty comment submission is blocked
- [ ] Customer cannot see internal agent notes

---

## 2. Agent User Stories

### US-A01: View Priority-Sorted Queue

**As an** agent, **I want to** see all tickets assigned to me sorted by priority, **so that** I work on the most urgent first.

**Acceptance Criteria:**

- [ ] Ticket queue shows only tickets assigned to the agent's domain
- [ ] Queue is sorted by finalPriority: CRITICAL → HIGH → MEDIUM → LOW
- [ ] Each ticket row shows: Ticket Number, Title, Priority Badge, Status Badge, SLA Ring Timer
- [ ] Agent can filter by status and priority

---

### US-A02: Update Ticket Status

**As an** agent, **I want to** update a ticket's status, **so that** the customer knows progress is being made.

**Acceptance Criteria:**

- [ ] Agent can change status: Open → In Progress → Resolved
- [ ] Status updates are reflected immediately in the UI
- [ ] Customer receives a notification when status changes
- [ ] Agent cannot set status to "Closed" (admin-only action)

---

### US-A03: View SLA Countdown Timer

**As an** agent, **I want to** see a live SLA countdown timer on each ticket, **so that** I know how much time I have left.

**Acceptance Criteria:**

- [ ] SLA ring timer updates every second on the frontend
- [ ] Timer shows remaining time (e.g., "2h 15m", "45m", "12m")
- [ ] Color changes: green → orange (< 2h) → red (< 30min)
- [ ] Timer stops and shows "BREACHED" when deadline passes

---

### US-A04: View SLA Monitor Page

**As an** agent, **I want to** see which tickets have breached SLA, are at risk, or are on track, **so that** I can prioritize my work.

**Acceptance Criteria:**

- [ ] SLA Monitor page groups tickets into three lanes: Breached, At Risk, On Track
- [ ] Breached lane shows tickets with slaBreached = true (red)
- [ ] At Risk lane shows tickets with < 30 minutes remaining (orange)
- [ ] On Track lane shows tickets with safe SLA status (green)
- [ ] Clicking a ticket navigates to the ticket detail page

---

### US-A05: Add Internal Notes

**As an** agent, **I want to** add internal notes on a ticket, **so that** I can document my investigation steps.

**Acceptance Criteria:**

- [ ] Internal notes section is separate from public comments
- [ ] Notes are only visible to agents and admins
- [ ] Customers cannot see internal notes
- [ ] Notes show author, text, and timestamp

---

### US-A06: Receive SLA Breach Notification

**As an** agent, **I want to** receive a notification when an SLA deadline is breached, **so that** I can take immediate action.

**Acceptance Criteria:**

- [ ] In-app notification is created when cron job detects breach
- [ ] Notification bell in navbar shows unread count (red badge)
- [ ] Clicking notification navigates to the affected ticket
- [ ] Agent can mark notifications as read

---

## 3. Admin User Stories

### US-AD01: View Admin Dashboard

**As an** admin, **I want to** see a dashboard with total tickets, open tickets, SLA breach rate, and active agents, **so that** I have a full system overview.

**Acceptance Criteria:**

- [ ] Dashboard shows summary stat cards: Total Tickets, Open Tickets, SLA Breach Rate, Active Agents
- [ ] Stats reflect real-time data from the database
- [ ] All tickets across all users are visible to admin
- [ ] Ticket table supports filtering by domain, priority, status, date

---

### US-AD02: Configure Domain Rules

**As an** admin, **I want to** configure domain-specific keyword → priority rules, **so that** the system auto-prioritizes tickets correctly.

**Acceptance Criteria:**

- [ ] Admin can view all rules for their domain in a table
- [ ] Admin can add a new rule: keyword (text input) + priority (dropdown)
- [ ] Multiple comma-separated keywords can be mapped to one priority
- [ ] Admin can edit existing rules (keyword or priority)
- [ ] Admin can delete rules with confirmation dialog
- [ ] New rules take effect immediately on the next ticket submission
- [ ] Keyword cannot be empty; priority must be selected

---

### US-AD03: Configure SLA Policies

**As an** admin, **I want to** set SLA policies per priority level, **so that** the system enforces the correct resolution times.

**Acceptance Criteria:**

- [ ] Admin sees an SLA policy table with all 4 priority levels
- [ ] Admin can edit resolutionTimeMin and escalateAfterMin for each level
- [ ] Changes apply only to new tickets (not retroactively)
- [ ] Default values are seeded: CRITICAL=60m, HIGH=240m, MEDIUM=1440m, LOW=4320m

---

### US-AD04: Manage Users

**As an** admin, **I want to** manage users (view, activate, deactivate, assign roles), **so that** I control who has access.

**Acceptance Criteria:**

- [ ] Admin can view a list of all users with: Name, Email, Role, Domain, Status
- [ ] Admin can activate or deactivate any user
- [ ] Deactivated users cannot log in (checked in authMiddleware)
- [ ] Admin can view individual user details
- [ ] Destructive actions (deactivate) require confirmation dialog

---

### US-AD05: View All Tickets

**As an** admin, **I want to** view all tickets across all users with filters, **so that** I have full visibility.

**Acceptance Criteria:**

- [ ] Admin sees all tickets (not just their own)
- [ ] Tickets can be filtered by: domain, priority, status, date range
- [ ] Ticket table shows all standard columns plus SLA timer
- [ ] Admin can click any ticket to see full details

---

### US-AD06: Override Ticket Priority

**As an** admin, **I want to** override a ticket's priority, **so that** I can manually correct mis-prioritized tickets.

**Acceptance Criteria:**

- [ ] Admin can change finalPriority from ticket detail page
- [ ] Override requires a reason (text field)
- [ ] SLA deadline is NOT recalculated on priority override
- [ ] Override is logged for audit purposes

---

### US-AD07: Assign Tickets to Agents

**As an** admin, **I want to** assign a ticket to a specific agent, **so that** the right person handles it.

**Acceptance Criteria:**

- [ ] Admin can select an agent from a dropdown on the ticket detail page
- [ ] Only active agents from the same domain are shown
- [ ] Agent receives a notification when assigned a ticket
- [ ] Ticket appears in the agent's queue immediately

---

### US-AD08: View SLA Performance Reports

**As an** admin, **I want to** view SLA performance reports, **so that** I can report compliance to management.

**Acceptance Criteria:**

- [ ] Report page shows: total tickets, resolved on time, SLA breached count, breach rate %
- [ ] Breach rate is broken down by priority level
- [ ] Admin can filter by date range
- [ ] Data is accurate and matches database records

---

## 4. System User Stories

### US-S01: Auto-Prioritize Tickets

**As** the system, **I want to** automatically scan ticket text for domain keywords and assign priority, **so that** critical tickets are identified instantly.

**Acceptance Criteria:**

- [ ] Priority engine runs on every POST /api/tickets
- [ ] Engine scans title + description (case-insensitive)
- [ ] Highest matching rule becomes systemPriority
- [ ] finalPriority = max(systemPriority, userPriority)
- [ ] No keyword match → finalPriority = userPriority
- [ ] Engine is domain-specific (no cross-domain rule firing)

---

### US-S02: Detect SLA Breaches

**As** the system, **I want to** automatically detect SLA breaches every 60 seconds, **so that** agents are alerted immediately.

**Acceptance Criteria:**

- [ ] Cron job runs every 60 seconds without fail
- [ ] Only checks tickets with status: open or in_progress
- [ ] Only processes tickets where slaBreached = false
- [ ] Breached tickets: slaBreached set to true + notification created
- [ ] Already-breached tickets are not reprocessed
- [ ] slaBreached cannot be set back to false

---

### US-S03: Calculate SLA Deadline

**As** the system, **I want to** calculate slaDeadline at ticket creation, **so that** the countdown timer is accurate.

**Acceptance Criteria:**

- [ ] slaDeadline = createdAt + resolutionTimeMin (from SLA policy for finalPriority)
- [ ] Deadline uses finalPriority (not userPriority)
- [ ] Deadline is stored on the ticket document at creation
- [ ] Deadline does NOT change when ticket status changes

---

## 5. Use Case Summary

| ID | Use Case | Actor | Primary Flow |
|---|---|---|---|
| UC-01 | Submit support ticket | Customer | Fill form → Engine runs → Priority assigned → SLA calculated → Ticket created |
| UC-02 | Resolve ticket before breach | Agent | Open queue → See SLA timer → Investigate → Update status → Close on time |
| UC-03 | Configure new domain rule | Admin | Open config → Add keyword + priority → Save → New rule active immediately |
| UC-04 | Detect SLA breach | System | Cron runs → Query overdue tickets → Flag breach → Notify agent |
| UC-05 | View SLA report | Admin | Open reports → Select date range → View stats → Export if needed |

---

## 6. Acceptance Criteria Summary Checklist

### Authentication System

- [ ] Customer, Agent, Admin can register and log in
- [ ] Invalid credentials return proper error messages
- [ ] JWT contains user ID, role, and tenantId
- [ ] Wrong-role access returns 403 Forbidden
- [ ] Token expiry forces re-login

### Priority Engine

- [ ] "payment failed" in Banking → systemPriority: CRITICAL
- [ ] "order not delivered" in E-Commerce → systemPriority: HIGH
- [ ] "exam portal down" in EdTech → systemPriority: CRITICAL
- [ ] No keyword match → finalPriority = userPriority
- [ ] User LOW + System CRITICAL → finalPriority: CRITICAL
- [ ] User HIGH + System LOW → finalPriority: HIGH
- [ ] Banking rules don't fire for EdTech tickets

### SLA Monitoring

- [ ] CRITICAL ticket → slaDeadline = createdAt + 60 min
- [ ] HIGH ticket → slaDeadline = createdAt + 240 min
- [ ] Cron detects overdue ticket within 60 seconds
- [ ] slaBreached set to true in database
- [ ] Notification created for assigned agent
- [ ] SLA ring timer shows correct colors

### Role-Based Access

- [ ] Customer sees only own tickets
- [ ] Agent sees only assigned/domain tickets
- [ ] Admin sees all tickets
- [ ] Only admin can configure domain rules and SLA policies
- [ ] Only agent/admin can update ticket status

---

*TicketIQ © 2026 — Software Engineering Subject Project*
