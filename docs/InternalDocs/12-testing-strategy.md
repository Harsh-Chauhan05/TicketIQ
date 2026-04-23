# TicketIQ — 12. Testing Strategy

> **Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document ID | 12-testing-strategy |
| Version | 1.0.0 |
| Testing Approach | Manual + Postman API Testing |
| Date | March 2026 |

---

## 1. Testing Overview

| Testing Level | Approach | Tools |
|---|---|---|
| API Testing | Manual endpoint testing | Postman / Thunder Client |
| Unit Testing | Priority engine validation | Manual test cases |
| Integration Testing | Full user flow testing | Browser + Postman |
| UI Testing | Visual and functional | Browser (Chrome DevTools) |
| Role-Based Testing | Access control verification | Multi-account testing |
| SLA Testing | Breach detection timing | Controlled test tickets |

---

## 2. API Testing — Postman Collection

### 2.1 Auth Endpoints

| # | Test Case | Method | Endpoint | Expected |
|---|---|---|---|---|
| 1 | Register customer | POST | `/api/auth/register` | 201 + JWT token |
| 2 | Register agent | POST | `/api/auth/register` | 201 + JWT token |
| 3 | Register admin | POST | `/api/auth/register` | 201 + JWT token |
| 4 | Register duplicate email | POST | `/api/auth/register` | 400 "Email already registered" |
| 5 | Register missing fields | POST | `/api/auth/register` | 400 validation errors |
| 6 | Login valid credentials | POST | `/api/auth/login` | 200 + JWT token |
| 7 | Login wrong password | POST | `/api/auth/login` | 401 "Invalid credentials" |
| 8 | Login non-existent email | POST | `/api/auth/login` | 401 "Invalid credentials" |
| 9 | Get current user (valid token) | GET | `/api/auth/me` | 200 + user object |
| 10 | Get current user (no token) | GET | `/api/auth/me` | 401 "Not authorized" |
| 11 | Login deactivated user | POST | `/api/auth/login` | 403 "Account deactivated" |

### 2.2 Ticket Endpoints

| # | Test Case | Method | Endpoint | Expected |
|---|---|---|---|---|
| 12 | Create ticket (customer) | POST | `/api/tickets` | 201 + ticket with systemPriority |
| 13 | Create ticket (agent) | POST | `/api/tickets` | 403 "Access denied" |
| 14 | Get own tickets (customer) | GET | `/api/tickets` | 200 + only own tickets |
| 15 | Get assigned tickets (agent) | GET | `/api/tickets` | 200 + domain tickets |
| 16 | Get all tickets (admin) | GET | `/api/tickets` | 200 + all tenant tickets |
| 17 | Get single ticket | GET | `/api/tickets/:id` | 200 + ticket details |
| 18 | Update status (agent) | PATCH | `/api/tickets/:id/status` | 200 + updated |
| 19 | Update status (customer) | PATCH | `/api/tickets/:id/status` | 403 "Access denied" |
| 20 | Override priority (admin) | PATCH | `/api/tickets/:id/priority` | 200 + updated |
| 21 | Override priority (agent) | PATCH | `/api/tickets/:id/priority` | 403 "Access denied" |
| 22 | Add comment | POST | `/api/tickets/:id/comment` | 200 + comment added |
| 23 | Add note (agent) | POST | `/api/tickets/:id/note` | 200 + note added |
| 24 | Add note (customer) | POST | `/api/tickets/:id/note` | 403 "Access denied" |
| 25 | Get breached tickets | GET | `/api/tickets/sla/breached` | 200 + breached list |

### 2.3 Domain & SLA Endpoints

| # | Test Case | Method | Endpoint | Expected |
|---|---|---|---|---|
| 26 | Get domain rules (admin) | GET | `/api/domains` | 200 + domain with rules |
| 27 | Get domain rules (customer) | GET | `/api/domains` | 403 "Access denied" |
| 28 | Add rule (admin) | POST | `/api/domains/rules` | 201 + updated domain |
| 29 | Update rule (admin) | PUT | `/api/domains/rules/:id` | 200 + updated |
| 30 | Delete rule (admin) | DELETE | `/api/domains/rules/:id` | 200 + deleted |
| 31 | Get SLA policies (admin) | GET | `/api/sla/policies` | 200 + policies array |
| 32 | Update SLA policy | PUT | `/api/sla/policies/:id` | 200 + updated |
| 33 | Get SLA reports | GET | `/api/sla/reports` | 200 + stats data |

---

## 3. Priority Engine Test Cases

### 3.1 Banking Domain

| # | Title | Description | User Priority | Expected System | Expected Final |
|---|---|---|---|---|---|
| PE-01 | "My payment failed" | "Transaction declined" | MEDIUM | CRITICAL | CRITICAL |
| PE-02 | "Account locked" | "Cannot access account" | LOW | CRITICAL | CRITICAL |
| PE-03 | "Wrong balance shown" | "Balance is incorrect" | LOW | HIGH | HIGH |
| PE-04 | "Change my address" | "Need to update address" | LOW | LOW | LOW |
| PE-05 | "Need help" | "General question" | MEDIUM | LOW | MEDIUM |

### 3.2 E-Commerce Domain

| # | Title | Description | User Priority | Expected System | Expected Final |
|---|---|---|---|---|---|
| PE-06 | "Order not delivered" | "Package never arrived" | LOW | HIGH | HIGH |
| PE-07 | "Refund not received" | "Money not returned" | MEDIUM | HIGH | HIGH |
| PE-08 | "Wrong item received" | "Got different product" | LOW | MEDIUM | MEDIUM |
| PE-09 | "Track my order" | "Where is my package" | LOW | LOW | LOW |

### 3.3 Healthcare Domain

| # | Title | Description | User Priority | Expected System | Expected Final |
|---|---|---|---|---|---|
| PE-10 | "System is down" | "Portal not loading" | LOW | CRITICAL | CRITICAL |
| PE-11 | "Patient data missing" | "Records not found" | MEDIUM | CRITICAL | CRITICAL |
| PE-12 | "Appointment failed" | "Booking not confirmed" | LOW | HIGH | HIGH |

### 3.4 EdTech Domain

| # | Title | Description | User Priority | Expected System | Expected Final |
|---|---|---|---|---|---|
| PE-13 | "Exam portal down" | "Cannot submit exam" | LOW | CRITICAL | CRITICAL |
| PE-14 | "Quiz not saving" | "Answers lost" | MEDIUM | CRITICAL | CRITICAL |
| PE-15 | "Video not loading" | "Lecture won't play" | LOW | MEDIUM | MEDIUM |

### 3.5 Cross-Domain Isolation

| # | Test Case | Expected |
|---|---|---|
| PE-16 | "Payment failed" submitted as EdTech ticket | No match → userPriority used |
| PE-17 | "Exam portal down" submitted as Banking ticket | No match → userPriority used |

---

## 4. SLA Monitoring Test Cases

| # | Test Case | Steps | Expected |
|---|---|---|---|
| SLA-01 | CRITICAL ticket SLA deadline | Create CRITICAL ticket | slaDeadline = createdAt + 60 min |
| SLA-02 | HIGH ticket SLA deadline | Create HIGH ticket | slaDeadline = createdAt + 240 min |
| SLA-03 | MEDIUM ticket SLA deadline | Create MEDIUM ticket | slaDeadline = createdAt + 1440 min |
| SLA-04 | LOW ticket SLA deadline | Create LOW ticket | slaDeadline = createdAt + 4320 min |
| SLA-05 | Breach detection | Create ticket with past slaDeadline | Cron sets slaBreached=true within 60s |
| SLA-06 | Notification on breach | Wait for breach | Notification doc created for agent |
| SLA-07 | No re-processing | Already breached ticket | Cron skips it (slaBreached=true filter) |
| SLA-08 | Resolved not checked | Resolved ticket past deadline | Cron skips (status not open/in_progress) |

### Procedure for SLA Breach Testing

```
1. Create a ticket via POST /api/tickets
2. Manually update slaDeadline in MongoDB to a past timestamp
3. Wait 60 seconds for cron job to run
4. Check ticket: slaBreached should be true
5. Check notifications: breach notification should exist
```

---

## 5. Role-Based Access Control Tests

### 5.1 Access Matrix

| Action | Customer | Agent | Admin | Test |
|---|---|---|---|---|
| Submit ticket | ✅ 201 | ❌ 403 | ✅ 201 | Try each role |
| View own tickets | ✅ | ✅ (assigned) | ✅ (all) | Login as each |
| Update status | ❌ 403 | ✅ 200 | ✅ 200 | PATCH as each |
| Override priority | ❌ 403 | ❌ 403 | ✅ 200 | PATCH as each |
| Add internal notes | ❌ 403 | ✅ 200 | ✅ 200 | POST as each |
| Configure rules | ❌ 403 | ❌ 403 | ✅ 200 | POST as each |
| Set SLA policies | ❌ 403 | ❌ 403 | ✅ 200 | PUT as each |
| Manage users | ❌ 403 | ❌ 403 | ✅ 200 | GET as each |

### 5.2 Tenant Isolation Tests

| # | Test Case | Expected |
|---|---|---|
| TI-01 | Tenant A customer queries tickets | Only Tenant A tickets returned |
| TI-02 | Tenant A admin views users | Only Tenant A users returned |
| TI-03 | Tenant A admin views domain rules | Only Tenant A domain rules |
| TI-04 | Ticket from Tenant B not visible to Tenant A | Empty result / 404 |

---

## 6. Frontend UI Testing

### 6.1 Auth Flow Tests

| # | Test | Steps | Expected |
|---|---|---|---|
| UI-01 | Registration | Fill form → Submit | Redirect to dashboard |
| UI-02 | Login | Enter email/password → Submit | Redirect to role dashboard |
| UI-03 | Invalid login | Wrong password → Submit | Error message shown |
| UI-04 | Form validation | Submit empty form | Inline errors on fields |
| UI-05 | Protected route | Visit /admin without login | Redirect to /login |

### 6.2 Customer UI Tests

| # | Test | Expected |
|---|---|---|
| UI-06 | Dashboard loads | Stats cards + recent tickets displayed |
| UI-07 | Submit ticket | Form works, ticket appears in list |
| UI-08 | Priority override shown | "System upgraded priority" message |
| UI-09 | SLA timer visible | Countdown ring on each ticket |
| UI-10 | Ticket detail | Full info + comments section |

### 6.3 Agent UI Tests

| # | Test | Expected |
|---|---|---|
| UI-11 | Queue sorted by priority | CRITICAL tickets at top |
| UI-12 | SLA timer colors | Green/orange/red based on time left |
| UI-13 | Status update | Dropdown works, status changes |
| UI-14 | SLA Monitor page | Three lanes: breached/at-risk/safe |
| UI-15 | Notification bell | Count updates, click opens list |

### 6.4 Admin UI Tests

| # | Test | Expected |
|---|---|---|
| UI-16 | Dashboard stats | Correct totals and breach rate |
| UI-17 | Add domain rule | Rule saved, table updates |
| UI-18 | Edit SLA policy | Time saved, new tickets use it |
| UI-19 | Activate/deactivate user | Toggle works, user state changes |
| UI-20 | SLA reports | Metrics match database counts |

---

## 7. Responsive Design Tests

| Breakpoint | Test | Expected |
|---|---|---|
| Mobile (< 768px) | Sidebar hidden | Bottom tab navigation |
| Mobile | Tables | Horizontal scroll or card layout |
| Tablet (768-1024px) | Sidebar collapsed | Icon-only sidebar (60px) |
| Desktop (> 1024px) | Full layout | Sidebar (240px) + main content |

---

## 8. End-to-End Flow Test

### Full System Flow

```
Step 1: Admin registers → logs in → seeds domain rules
Step 2: Admin configures SLA policies for Banking domain
Step 3: Agent registers (Banking domain)
Step 4: Customer registers (Banking domain)
Step 5: Customer submits ticket: "My payment failed twice"
        → Engine assigns CRITICAL → SLA deadline = 60 min
Step 6: Agent sees ticket in queue (CRITICAL, top of list)
Step 7: Agent updates status to "In Progress"
Step 8: Agent adds internal note
Step 9: Agent resolves ticket → status = "Resolved"
Step 10: Customer sees updated status in dashboard
Step 11: Admin views SLA reports → ticket resolved on time
Step 12: Create another ticket → let SLA expire
Step 13: Cron job detects breach → slaBreached = true
Step 14: Agent sees breach notification
Step 15: Admin sees increased breach count in reports

PASS: All 15 steps complete successfully
```

---

## 9. Bug Tracking & Reporting

### Bug Report Template

```
Bug ID:     BUG-001
Severity:   Critical / High / Medium / Low
Status:     Open / In Progress / Fixed / Closed

Summary:    [One-line description]
Steps:      [How to reproduce]
Expected:   [What should happen]
Actual:     [What actually happens]
Screenshot: [If applicable]
Fix:        [Description of fix applied]
```

---

*TicketIQ © 2026 — Software Engineering Subject Project*
