# TicketIQ — Product Requirements Document (PRD)

> **Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document Type | Product Requirements Document (PRD) |
| Version | 1.0.0 |
| Product Name | TicketIQ |
| Tech Stack | MERN (MongoDB, Express, React, Node.js) |
| Project Type | Software Engineering Subject Project |
| Target Users | Customers, Support Agents, Admins |
| Date | March 2026 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision](#3-product-vision)
4. [Target Users & Personas](#4-target-users--personas)
5. [Business Requirements](#5-business-requirements)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Domain-Adaptive Requirements](#8-domain-adaptive-requirements)
9. [SLA Requirements](#9-sla-requirements)
10. [UI/UX Requirements](#10-uiux-requirements)
11. [System Constraints](#11-system-constraints)
12. [Use Cases](#12-use-cases)
13. [Acceptance Criteria](#13-acceptance-criteria)
14. [Risk Analysis](#14-risk-analysis)
15. [Success Metrics](#15-success-metrics)

---

## 1. Executive Summary

TicketIQ is a domain-adaptive, multi-tenant customer support management platform. It solves a critical problem that every support team faces — **the inability to automatically know which ticket is most urgent** and **the inability to track whether deadlines are being met** — without manual intervention.

The product is built on the MERN stack and targets enterprise businesses across four industry domains: Banking, E-Commerce, Healthcare, and EdTech. Each domain has different definitions of what is "critical", and TicketIQ adapts to those definitions automatically.

### 1.1 Product Summary

| Attribute | Detail |
|---|---|
| Product Name | TicketIQ |
| Product Type | B2B SaaS — Customer Support Management |
| Core Value | Auto-prioritizes tickets using domain-specific rules + monitors SLA deadlines |
| Target Market | SMEs and enterprises in Banking, E-Commerce, Healthcare, EdTech |
| Architecture | Multi-tenant, Role-Based, Domain-Adaptive |
| Deployment | Cloud (Vercel + Render + MongoDB Atlas) |

---

## 2. Problem Statement

### 2.1 The Core Problem

Customer support teams in every industry struggle with the same three problems:

**Problem 1 — Tickets are not prioritized intelligently**
When a payment failure ticket and a "how do I change my username" ticket arrive at the same time, agents without a smart system treat them equally. The payment failure goes unresolved for hours. The customer churns.

**Problem 2 — SLA deadlines are missed because there is no monitoring**
Most teams agree on SLA commitments (e.g. critical tickets resolved in 1 hour) but have no automated system to track whether those commitments are being met in real time. Breaches are discovered after the fact, not prevented.

**Problem 3 — Priority rules differ between industries**
A "system down" ticket in healthcare is a life-threatening emergency. The same ticket in an online store is important but not critical. Generic helpdesk tools apply one-size-fits-all rules that do not respect industry context.

### 2.2 Current Situation (Without TicketIQ)

```
Customer submits ticket
        ↓
Ticket enters a flat queue (no smart priority)
        ↓
Agent picks a ticket manually (often by recency, not urgency)
        ↓
No SLA tracking — agent may not even know there is a deadline
        ↓
Critical ticket sits unresolved for hours
        ↓
SLA breach discovered after the fact
        ↓
Customer complaint / churn / reputation damage
```

### 2.3 With TicketIQ

```
Customer submits ticket
        ↓
Domain Rules Engine scans title + description
        ↓
System auto-assigns CRITICAL / HIGH / MEDIUM / LOW
        ↓
SLA deadline calculated and countdown begins
        ↓
Agent sees priority-sorted queue — CRITICAL tickets on top
        ↓
Real-time SLA ring timer on every ticket
        ↓
Alert fires when SLA is about to breach
        ↓
Ticket resolved on time — customer satisfied
```

---

## 3. Product Vision

### 3.1 Vision Statement

> **"Make every support team as efficient as the best support team in the world — regardless of their size, industry, or technical capability."**

### 3.2 Mission

To eliminate missed SLA deadlines and mishandled ticket priorities by providing an intelligent, domain-aware, real-time support management platform that any business can configure and deploy without technical expertise.

### 3.3 Product Positioning

| | Generic Helpdesk Tools | TicketIQ |
|---|---|---|
| Priority Assignment | Manual by agent | Automatic via domain rules engine |
| SLA Monitoring | Basic (if any) | Real-time countdown + breach detection |
| Industry Awareness | None — one size fits all | Domain-adaptive (Banking, E-Commerce, etc.) |
| Multi-Tenancy | Limited | Full tenant isolation |
| Configuration | Complex setup | Admin UI, no code required |
| Target Market | Any business | SME to Enterprise, specific industries |

---

## 4. Target Users & Personas

### 4.1 Persona 1 — The Customer (Rahul)

```
Name        : Rahul Mehta
Age         : 28
Occupation  : Google Pay user
Domain      : Banking / Payments
Goal        : Get his payment issue resolved FAST
Frustration : Submits ticket, hears nothing for hours,
              doesn't know if anyone is even looking at it
Needs from TicketIQ:
  - Know his ticket was received and prioritized
  - See an estimated resolution time (SLA)
  - Track ticket status without calling support
  - Add more information if needed
```

### 4.2 Persona 2 — The Support Agent (Priya)

```
Name        : Priya Sharma
Age         : 26
Occupation  : Support Agent at an E-Commerce company
Domain      : E-Commerce / Retail
Goal        : Resolve as many tickets as possible correctly,
              within deadline, without getting overwhelmed
Frustration : 80 tickets in queue with no idea which
              to work on first. Misses SLA constantly
              because there is no countdown visible.
Needs from TicketIQ:
  - Clear priority-sorted ticket queue
  - SLA countdown timer on every ticket
  - Alert before SLA breach, not after
  - Ability to add notes and update status easily
```

### 4.3 Persona 3 — The Admin (Aakash)

```
Name        : Aakash Patel
Age         : 34
Occupation  : Support Manager at a Healthcare company
Domain      : Healthcare
Goal        : Ensure his team resolves critical issues on time,
              configure the right rules for healthcare context,
              and report SLA performance to management
Frustration : No visibility into what is breaching SLA.
              Cannot configure rules without a developer.
              Reports are manual and always outdated.
Needs from TicketIQ:
  - Real-time dashboard showing SLA breach rate
  - Ability to configure domain rules from the UI
  - User management (add/remove agents)
  - SLA reports for management
```

---

## 5. Business Requirements

### 5.1 Core Business Requirements

| ID | Requirement | Priority |
|---|---|---|
| BR-01 | System must support multiple tenants (businesses) on one platform | Critical |
| BR-02 | Each tenant's data must be fully isolated from other tenants | Critical |
| BR-03 | System must support 4 industry domains: Banking, E-Commerce, Healthcare, EdTech | Critical |
| BR-04 | Each domain must have configurable keyword-to-priority rules | Critical |
| BR-05 | SLA policies must be configurable per priority level per domain | Critical |
| BR-06 | System must support 3 user roles: Customer, Agent, Admin | Critical |
| BR-07 | Admin must be able to manage users without developer help | High |
| BR-08 | System must automatically prioritize tickets without agent intervention | Critical |
| BR-09 | SLA breaches must be detected and reported automatically | Critical |
| BR-10 | System must provide analytics on SLA performance | High |

### 5.2 Stakeholder Requirements

| Stakeholder | Requirement |
|---|---|
| Customer | Fast ticket submission, real-time status tracking, SLA visibility |
| Support Agent | Priority-sorted queue, SLA timers, breach alerts, easy status updates |
| Admin | Domain config, SLA policy management, user management, reports |
| Business Owner | SLA compliance rate, agent performance, customer satisfaction |

---

## 6. Functional Requirements

### 6.1 Authentication & Authorization

| ID | Requirement | Role | Priority |
|---|---|---|---|
| FR-AUTH-01 | User must be able to register with name, email, password, domain, role | All | Critical |
| FR-AUTH-02 | User must be able to log in with email and password | All | Critical |
| FR-AUTH-03 | System must issue a JWT token on successful login | All | Critical |
| FR-AUTH-04 | JWT token must expire after 7 days | All | Critical |
| FR-AUTH-05 | All routes except login/register must require a valid token | All | Critical |
| FR-AUTH-06 | Each role must only access routes permitted for their role | All | Critical |
| FR-AUTH-07 | User must be able to view and update their own profile | All | High |
| FR-AUTH-08 | Admin must be able to activate or deactivate any user | Admin | High |

### 6.2 Ticket Management

| ID | Requirement | Role | Priority |
|---|---|---|---|
| FR-TKT-01 | Customer must be able to submit a ticket with title, description, category, and priority | Customer | Critical |
| FR-TKT-02 | System must auto-generate a unique ticket number on creation | System | Critical |
| FR-TKT-03 | System must run the priority engine on every new ticket | System | Critical |
| FR-TKT-04 | System must calculate and store the SLA deadline on ticket creation | System | Critical |
| FR-TKT-05 | Customer must see their submitted tickets in a list | Customer | Critical |
| FR-TKT-06 | Customer must see the status, priority, and SLA on each ticket | Customer | Critical |
| FR-TKT-07 | Agent must see all assigned tickets sorted by finalPriority | Agent | Critical |
| FR-TKT-08 | Agent must be able to update ticket status | Agent | Critical |
| FR-TKT-09 | Agent must be able to add internal notes (not visible to customer) | Agent | High |
| FR-TKT-10 | Customer and Agent must be able to add comments on a ticket | Both | High |
| FR-TKT-11 | Admin must be able to view all tickets across all users | Admin | Critical |
| FR-TKT-12 | Admin must be able to override ticket priority with a reason | Admin | High |
| FR-TKT-13 | Admin must be able to assign a ticket to a specific agent | Admin | High |
| FR-TKT-14 | Ticket status flow must be: Open → In Progress → Resolved → Closed | System | Critical |

### 6.3 Priority Engine

| ID | Requirement | Role | Priority |
|---|---|---|---|
| FR-PE-01 | System must scan ticket title and description for domain keywords | System | Critical |
| FR-PE-02 | System must assign systemPriority based on highest matching rule | System | Critical |
| FR-PE-03 | If systemPriority is higher than userPriority, system must override to finalPriority | System | Critical |
| FR-PE-04 | If no keyword matches, finalPriority must default to userPriority | System | Critical |
| FR-PE-05 | Priority engine must be domain-specific — rules from one domain must not apply to another | System | Critical |
| FR-PE-06 | Admin must be able to add, edit, and delete keyword rules from the UI | Admin | Critical |
| FR-PE-07 | New rules must take effect immediately on the next ticket submission | System | High |

### 6.4 SLA Monitoring

| ID | Requirement | Role | Priority |
|---|---|---|---|
| FR-SLA-01 | System must calculate slaDeadline at ticket creation using the SLA policy for finalPriority | System | Critical |
| FR-SLA-02 | A background cron job must check for SLA breaches every 60 seconds | System | Critical |
| FR-SLA-03 | Tickets past slaDeadline must be flagged slaBreached: true automatically | System | Critical |
| FR-SLA-04 | A notification must be created for the assigned agent when SLA is breached | System | Critical |
| FR-SLA-05 | Agent must see a real-time SLA countdown ring timer on every ticket | Agent | Critical |
| FR-SLA-06 | Agent must see an SLA Monitor page showing breached, at-risk, and safe tickets | Agent | Critical |
| FR-SLA-07 | Admin must be able to configure resolution time per priority level | Admin | Critical |
| FR-SLA-08 | Admin must be able to view overall SLA breach statistics | Admin | High |

### 6.5 Notifications

| ID | Requirement | Role | Priority |
|---|---|---|---|
| FR-NOT-01 | Agent must receive a notification when a new ticket is assigned to them | Agent | High |
| FR-NOT-02 | Agent must receive a notification when their ticket breaches SLA | Agent | Critical |
| FR-NOT-03 | Customer must receive a notification when their ticket status changes | Customer | High |
| FR-NOT-04 | Admin must receive a notification when a ticket is escalated | Admin | High |
| FR-NOT-05 | User must be able to mark notifications as read | All | Medium |
| FR-NOT-06 | Unread notification count must be shown in the navbar | All | Medium |

### 6.6 Admin Controls

| ID | Requirement | Role | Priority |
|---|---|---|---|
| FR-ADM-01 | Admin must see a dashboard with total tickets, breach rate, active agents | Admin | Critical |
| FR-ADM-02 | Admin must be able to manage domain rules (add, edit, delete) | Admin | Critical |
| FR-ADM-03 | Admin must be able to manage SLA policies per priority level | Admin | Critical |
| FR-ADM-04 | Admin must be able to view, activate, and deactivate users | Admin | High |
| FR-ADM-05 | Admin must be able to generate SLA performance reports | Admin | High |
| FR-ADM-06 | Admin must be able to filter all tickets by domain, priority, status, date | Admin | High |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-PERF-01 | API response time for ticket list | < 500ms |
| NFR-PERF-02 | API response time for ticket creation (including engine) | < 1000ms |
| NFR-PERF-03 | SLA cron job execution time | < 5 seconds per run |
| NFR-PERF-04 | Frontend page load time (initial) | < 3 seconds |
| NFR-PERF-05 | Frontend page navigation (SPA routing) | < 300ms |

### 7.2 Security

| ID | Requirement |
|---|---|
| NFR-SEC-01 | All passwords must be hashed with bcrypt (minimum 10 salt rounds) |
| NFR-SEC-02 | JWT tokens must never be stored in localStorage (use httpOnly cookies) |
| NFR-SEC-03 | Every database query must include tenantId filter to prevent cross-tenant data access |
| NFR-SEC-04 | All API inputs must be validated and sanitized before processing |
| NFR-SEC-05 | CORS must only allow requests from the registered frontend origin |
| NFR-SEC-06 | Auth endpoints must be rate-limited to prevent brute-force attacks |
| NFR-SEC-07 | Sensitive config (DB URI, JWT secret) must never be committed to version control |

### 7.3 Reliability

| ID | Requirement | Target |
|---|---|---|
| NFR-REL-01 | System uptime | 99% (for project purposes) |
| NFR-REL-02 | SLA cron job must not skip a cycle even under load | Guaranteed |
| NFR-REL-03 | Failed API calls must return structured error responses | Always |
| NFR-REL-04 | Database connection must auto-reconnect on failure | Yes |

### 7.4 Usability

| ID | Requirement |
|---|---|
| NFR-USE-01 | UI must be fully responsive (mobile, tablet, desktop) |
| NFR-USE-02 | Priority badges must use consistent colors across all pages (CRITICAL=red, HIGH=orange, MEDIUM=blue, LOW=green) |
| NFR-USE-03 | SLA ring timer must be visible on every ticket in queue and detail views |
| NFR-USE-04 | All forms must show inline validation errors |
| NFR-USE-05 | All tables must support filtering and sorting |
| NFR-USE-06 | Loading states must be shown during all API calls |

### 7.5 Scalability

| ID | Requirement |
|---|---|
| NFR-SCA-01 | Database schema must support adding new domains without code changes |
| NFR-SCA-02 | SLA policies must be stored per tenant so each business can have different rules |
| NFR-SCA-03 | Priority engine rules must be data-driven (stored in DB, not hardcoded) |
| NFR-SCA-04 | New tenants can be onboarded by seeding domain + SLA data only |

### 7.6 Maintainability

| ID | Requirement |
|---|---|
| NFR-MNT-01 | Backend must follow MVC pattern (Models, Controllers, Routes, Services) |
| NFR-MNT-02 | Frontend must separate API calls into dedicated api/ files |
| NFR-MNT-03 | Reusable UI components (Badge, Timer, Card) must be in components/ folder |
| NFR-MNT-04 | Environment variables must be used for all config values |
| NFR-MNT-05 | Code must be organized by feature/role, not by file type |

---

## 8. Domain-Adaptive Requirements

### 8.1 Supported Domains

| Domain | Industry | Key Ticket Types |
|---|---|---|
| Banking | Financial Services, Payments | Payment failures, account issues, fraud |
| E-Commerce | Online Retail, Delivery | Order issues, refunds, delivery problems |
| Healthcare | Medical Platforms, Hospitals | System outages, patient data, appointments |
| EdTech | Online Education, E-Learning | Exam issues, content access, certificates |

### 8.2 Domain Selection Requirements

| ID | Requirement |
|---|---|
| DR-01 | Admin must select the business domain when setting up the tenant |
| DR-02 | Each tenant can only have one active domain at a time (MVP) |
| DR-03 | Domain selection determines which default rules are seeded |
| DR-04 | Domain is shown as a read-only badge on every ticket |
| DR-05 | Agents are assigned to a domain — they only see tickets from their domain |

### 8.3 Rules Engine Requirements

| ID | Requirement |
|---|---|
| DR-06 | Rules must be stored in the database — not hardcoded in application logic |
| DR-07 | Each rule must have: a keyword string, a priority level, and a domain reference |
| DR-08 | Multiple comma-separated keywords can be mapped to one priority in a single rule |
| DR-09 | Keyword matching must be case-insensitive |
| DR-10 | When multiple rules match, the highest priority wins |
| DR-11 | When no rules match, finalPriority equals the user-selected priority |
| DR-12 | Admin can add unlimited rules per domain |

---

## 9. SLA Requirements

### 9.1 SLA Policy Requirements

| ID | Requirement |
|---|---|
| SR-01 | Each tenant must have SLA policies defined for all 4 priority levels |
| SR-02 | SLA policy must define: resolutionTimeMin and escalateAfterMin |
| SR-03 | Default SLA policies must be seeded on tenant creation |
| SR-04 | Admin can override default SLA times from the UI |
| SR-05 | SLA changes must apply only to new tickets (not retroactively) |

### 9.2 SLA Calculation Requirements

| ID | Requirement |
|---|---|
| SR-06 | slaDeadline must be calculated as: createdAt + resolutionTimeMin |
| SR-07 | slaDeadline must use finalPriority (not userPriority) for the policy lookup |
| SR-08 | slaDeadline must be stored on the ticket document at creation time |
| SR-09 | slaDeadline must not change when ticket status changes |

### 9.3 SLA Monitoring Requirements

| ID | Requirement |
|---|---|
| SR-10 | Cron job must run every 60 seconds |
| SR-11 | Cron job must only process tickets with status open or in_progress |
| SR-12 | Cron job must only process tickets where slaBreached is false |
| SR-13 | When breach detected: set slaBreached = true, create notification |
| SR-14 | SLA ring timer on frontend must update in real time (every second) |
| SR-15 | SLA ring color must change based on time remaining: green → orange → red |
| SR-16 | SLA Monitor page must group tickets into: Breached, At Risk, On Track |

### 9.4 Default SLA Policies

| Priority | Resolution Time | Escalation Alert |
|---|---|---|
| CRITICAL | 60 minutes | 45 minutes |
| HIGH | 240 minutes (4 hours) | 180 minutes (3 hours) |
| MEDIUM | 1440 minutes (24 hours) | 1200 minutes (20 hours) |
| LOW | 4320 minutes (72 hours) | 3600 minutes (60 hours) |

---

## 10. UI/UX Requirements

### 10.1 Design System

| Attribute | Specification |
|---|---|
| Color Theme | Midnight Navy + Gold (dark mode) |
| Primary Background | #0A0E1A |
| Card Background | #131C35 |
| Accent Color | #C9A84C (Gold) |
| Primary Text | #F0F4FF |
| Secondary Text | #8B9CC8 |
| Font | Inter or Geist Sans |
| Border Radius | 12px for cards, 8px for inputs, full for badges |

### 10.2 Priority Color System

| Priority | Background | Border | Text |
|---|---|---|---|
| CRITICAL | #EF444420 | #EF4444 | #EF4444 |
| HIGH | #F59E0B20 | #F59E0B | #F59E0B |
| MEDIUM | #3B82F620 | #3B82F6 | #3B82F6 |
| LOW | #22C55E20 | #22C55E | #22C55E |

### 10.3 Status Color System

| Status | Color |
|---|---|
| OPEN | Blue (#3B82F6) |
| IN PROGRESS | Gold (#C9A84C) |
| RESOLVED | Green (#22C55E) |
| BREACHED | Red (#EF4444) |

### 10.4 Layout Requirements

| ID | Requirement |
|---|---|
| UX-01 | All logged-in pages must have a fixed top navbar and collapsible sidebar |
| UX-02 | Sidebar active state must highlight with gold left border |
| UX-03 | All ticket tables must show: ID, Title, Priority Badge, Status Badge, SLA Timer, Date |
| UX-04 | Submit ticket form must show a validation message when system overrides priority |
| UX-05 | SLA ring timer must always be visible next to the ticket without needing to open it |
| UX-06 | Admin dashboard must show summary stats in cards at the top of the page |
| UX-07 | All modals must close on Escape key and outside click |
| UX-08 | All destructive actions must require a confirmation dialog |

### 10.5 Responsive Breakpoints

| Breakpoint | Layout Behavior |
|---|---|
| Mobile (< 768px) | Sidebar hidden, bottom tab navigation, single column layout |
| Tablet (768px – 1024px) | Sidebar collapsed to icon-only (60px width) |
| Desktop (> 1024px) | Full sidebar (240px), multi-column layout |

---

## 11. System Constraints

### 11.1 Technical Constraints

| Constraint | Detail |
|---|---|
| Tech Stack | Must use MERN (MongoDB, Express, React, Node.js) only |
| Database | MongoDB only — no relational database |
| Authentication | JWT only — no OAuth or third-party auth for MVP |
| Styling | Tailwind CSS only |
| State Management | React Context API — no Redux for MVP |
| Deployment | Free tier hosting (Vercel + Render + MongoDB Atlas free tier) |

### 11.2 Project Constraints

| Constraint | Detail |
|---|---|
| Team | Single developer (student project) |
| Timeline | 6 weeks build time |
| Budget | Zero — all free tier services |
| Scope | MVP only — no enterprise features in v1 |

### 11.3 Known Limitations (MVP)

| Limitation | Impact | Mitigation |
|---|---|---|
| No real-time updates (no WebSockets) | Agent must refresh to see new tickets | Page auto-refresh every 30 seconds |
| No email notifications | Agents only see in-app notifications | In-app notification bell with badge count |
| No file attachments | Customers cannot upload screenshots | Can paste image URLs in description |
| Free tier Render server sleeps after inactivity | First request may take 30 seconds | Show loading state, inform user |
| MongoDB Atlas free tier (512MB storage) | Limited ticket volume | Sufficient for demo/project purposes |

---

## 12. Use Cases

### UC-01 — Customer Submits a Ticket

```
Actor       : Customer
Goal        : Report a payment issue
Precondition: Customer is logged in

Main Flow:
  1. Customer clicks "Submit New Ticket"
  2. Customer fills: Title = "My payment failed twice"
                     Description = "Transaction was declined both times"
                     Category = "Payment"
                     Priority = "Medium" (user's guess)
  3. Customer clicks Submit
  4. System runs priority engine:
       - Detects keyword "payment failed" in title
       - Domain is Banking → rule maps to CRITICAL
  5. System sets systemPriority = CRITICAL
  6. System overrides: finalPriority = CRITICAL (higher than user's Medium)
  7. System calculates: slaDeadline = now + 60 minutes
  8. Ticket TKT-00042 created successfully
  9. Customer sees ticket in dashboard with CRITICAL badge
     and SLA countdown of 60 minutes

Alternate Flow:
  - If no keywords match → finalPriority = userPriority (Medium)
  - If title/description empty → form shows validation error
```

### UC-02 — Agent Resolves a Ticket Before SLA Breach

```
Actor       : Support Agent
Goal        : Resolve a critical ticket before the deadline
Precondition: Agent is logged in, ticket is assigned to them

Main Flow:
  1. Agent opens Ticket Queue page
  2. Sees TKT-00042 at top of list (CRITICAL, SLA ring showing 45min left)
  3. Agent clicks ticket to open detail view
  4. Agent reads description, investigates payment gateway
  5. Agent adds internal note: "Checked payment gateway — processing error on bank side"
  6. Agent updates status to "In Progress"
  7. Agent resolves the issue
  8. Agent updates status to "Resolved"
  9. slaBreached remains false (resolved before deadline)
  10. Customer receives status update notification

Alternate Flow:
  - If agent does not resolve in 60 min → cron job sets slaBreached = true
  - Agent receives SLA breach notification
  - Ticket moves to Breached lane on SLA Monitor page
```

### UC-03 — Admin Configures a New Domain Rule

```
Actor       : Admin
Goal        : Add a new keyword rule to improve auto-prioritization
Precondition: Admin is logged in, domain is Banking

Main Flow:
  1. Admin goes to Domain Configuration page
  2. Sees existing rules for Banking domain
  3. Clicks "+ Add Rule"
  4. Enters keyword: "fraud detected, suspicious transaction"
  5. Selects priority: CRITICAL
  6. Clicks Save
  7. Rule is added to Banking domain rules in database
  8. Next ticket containing "fraud detected" → auto-assigned CRITICAL

Validation:
  - Keyword cannot be empty
  - Priority must be selected
  - Duplicate keywords show a warning
```

### UC-04 — SLA Breach Detected by Cron Job

```
Actor       : System (automated)
Goal        : Detect and flag SLA-breached tickets
Trigger     : Cron job runs every 60 seconds

Main Flow:
  1. Cron job runs at T+60 minutes
  2. Queries: tickets where status IN [open, in_progress]
              AND slaDeadline < now
              AND slaBreached = false
  3. Finds TKT-00099 (CRITICAL, slaDeadline passed 5 minutes ago)
  4. Sets TKT-00099.slaBreached = true
  5. Creates Notification for assigned agent:
     "SLA breached for ticket TKT-00099"
  6. Agent sees red notification badge in navbar
  7. TKT-00099 appears in Breached lane on SLA Monitor

Post-condition:
  - slaBreached cannot be set back to false
  - Ticket remains in Breached state even after resolution
  - Breach is recorded in SLA reports
```

### UC-05 — Admin Views SLA Performance Report

```
Actor       : Admin
Goal        : Review team's SLA performance for the week
Precondition: Admin is logged in

Main Flow:
  1. Admin navigates to SLA Reports page
  2. Selects date range: Last 7 days
  3. System shows:
       - Total tickets: 142
       - Resolved on time: 118 (83%)
       - SLA breached: 24 (17%)
       - Breach rate by priority: CRITICAL 2%, HIGH 8%, MEDIUM 23%
  4. Admin sees agent performance table
  5. Admin exports report as CSV for management
```

---

## 13. Acceptance Criteria

### 13.1 Authentication

- [ ] User can register and immediately log in
- [ ] Incorrect password returns "Invalid credentials" error
- [ ] JWT token is valid and contains user ID + role
- [ ] Accessing `/admin/*` route as Customer returns 403
- [ ] Accessing `/agent/*` route as Customer returns 403
- [ ] Token expiry after 7 days forces re-login

### 13.2 Ticket Priority Engine

- [ ] Ticket with "payment failed" in title → `systemPriority: critical` (Banking)
- [ ] Ticket with "order not delivered" → `systemPriority: high` (E-Commerce)
- [ ] Ticket with "exam portal down" → `systemPriority: critical` (EdTech)
- [ ] Ticket with "change my username" → `systemPriority: low` (no keyword match)
- [ ] User selects LOW, system detects CRITICAL → `finalPriority: critical`
- [ ] User selects HIGH, system detects LOW → `finalPriority: high` (user wins)
- [ ] Engine is domain-specific — banking rule does not fire for edtech ticket

### 13.3 SLA Monitoring

- [ ] CRITICAL ticket created → `slaDeadline = createdAt + 60 min`
- [ ] HIGH ticket created → `slaDeadline = createdAt + 240 min`
- [ ] Cron job runs and detects overdue ticket within 60 seconds
- [ ] Overdue ticket → `slaBreached: true` in database
- [ ] Notification created in database for assigned agent
- [ ] Resolved ticket with `slaBreached: false` → not affected by cron job
- [ ] SLA ring timer on frontend shows correct color: green / orange / red

### 13.4 Role-Based Access

- [ ] Customer sees only their own tickets
- [ ] Agent sees only tickets assigned to their domain/them
- [ ] Admin sees all tickets across all users
- [ ] Only admin can configure domain rules
- [ ] Only admin can change SLA policy settings
- [ ] Only agent/admin can update ticket status

### 13.5 Admin Configuration

- [ ] Admin adds rule: keyword "server crash", priority CRITICAL
- [ ] Next ticket with "server crash" → auto-assigned CRITICAL
- [ ] Admin changes MEDIUM resolution time from 1440 to 720 minutes
- [ ] New MEDIUM ticket → slaDeadline = createdAt + 720 min
- [ ] Admin deactivates agent → agent cannot log in

---

## 14. Risk Analysis

### 14.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cron job misses SLA breaches under load | Low | High | Test with bulk tickets, ensure async processing |
| Priority engine returns wrong priority | Medium | High | Unit test engine with edge cases |
| MongoDB Atlas free tier limit reached | Low | Medium | Monitor usage, archive old tickets |
| Render server sleeps on free tier | High | Low | Show loading indicator, document behavior |
| JWT token not invalidated on user deactivation | Medium | High | Check user.isActive in authMiddleware |
| Cross-tenant data leak via missing tenantId | Low | Critical | Always include tenantId in every query |

### 14.2 Product Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Admin configures wrong domain rules | Medium | Medium | Show preview of how rule affects priority |
| Customer gets confused by priority override | Medium | Low | Show clear message: "System upgraded your priority" |
| Agent ignores SLA breach notification | Medium | High | Make breach visually prominent (red banner) |
| Too many notification types overwhelm users | Low | Medium | Group and summarize notifications |

---

## 15. Success Metrics

### 15.1 MVP Success Metrics (Project Evaluation)

| Metric | Target |
|---|---|
| Priority engine accuracy | Correct priority on 95%+ of test tickets |
| SLA breach detection rate | 100% of breached tickets flagged within 60 seconds |
| Role access enforcement | 0 unauthorized access incidents in testing |
| Page load time | All pages load under 3 seconds |
| Full user flow completion | Customer → Submit → Agent → Resolve → Admin → Report works end-to-end |
| All 22 pages functional | 100% of MVP pages built and working |

### 15.2 Product Success Metrics (If Launched)

| Metric | Target (3 months post-launch) |
|---|---|
| SLA breach rate reduction | 40% reduction vs pre-TicketIQ baseline |
| Average ticket resolution time | 30% faster |
| Agent time-to-first-response | Reduced by 50% due to priority sorting |
| Admin configuration changes | Admin updates rules without developer help |
| Customer satisfaction (CSAT) | Increase from baseline |

---

*TicketIQ © 2026 — Software Engineering Subject Project*
