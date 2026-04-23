# TicketIQ — 01. Product Requirements

> **Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document ID | 01-product-requirements |
| Version | 1.0.0 |
| Product Name | TicketIQ |
| Tech Stack | MERN (MongoDB, Express, React, Node.js) |
| Date | March 2026 |

---

## 1. Executive Summary

TicketIQ is a **domain-adaptive, multi-tenant customer support management platform** built on the MERN stack. It solves three critical problems that every support team faces:

1. **Tickets are not prioritized intelligently** — agents treat all tickets equally without automated urgency assessment
2. **SLA deadlines are missed** — no real-time monitoring or breach prevention exists
3. **Priority rules differ between industries** — generic helpdesk tools apply one-size-fits-all rules

The platform targets enterprise businesses across **four industry domains**: Banking, E-Commerce, Healthcare, and EdTech, each with different definitions of what is "critical."

### Product Summary

| Attribute | Detail |
|---|---|
| Product Type | B2B SaaS — Customer Support Management |
| Core Value | Auto-prioritizes tickets using domain-specific rules + monitors SLA deadlines |
| Target Market | SMEs and enterprises in Banking, E-Commerce, Healthcare, EdTech |
| Architecture | Multi-tenant, Role-Based, Domain-Adaptive |
| Deployment | Cloud (Vercel + Render + MongoDB Atlas) |

---

## 2. Problem Statement

### Without TicketIQ

```
Customer submits ticket → Flat queue (no smart priority) → Agent picks manually
→ No SLA tracking → Critical ticket unresolved for hours → SLA breach discovered after the fact
→ Customer complaint / churn / reputation damage
```

### With TicketIQ

```
Customer submits ticket → Domain Rules Engine scans text → System auto-assigns priority
→ SLA countdown begins → Agent sees priority-sorted queue → Real-time SLA ring timer
→ Alert fires before breach → Ticket resolved on time → Customer satisfied
```

---

## 3. Product Vision

> **"Make every support team as efficient as the best support team in the world — regardless of their size, industry, or technical capability."**

### Mission

Eliminate missed SLA deadlines and mishandled ticket priorities by providing an intelligent, domain-aware, real-time support management platform.

### Competitive Advantage

| Aspect | Generic Helpdesk Tools | TicketIQ |
|---|---|---|
| Priority Assignment | Manual by agent | Automatic via domain rules engine |
| SLA Monitoring | Basic (if any) | Real-time countdown + breach detection |
| Industry Awareness | None — one size fits all | Domain-adaptive (4 industries) |
| Multi-Tenancy | Limited | Full tenant isolation |
| Configuration | Complex setup | Admin UI, no code required |

---

## 4. Target Users & Personas

### Persona 1 — Customer (Rahul Mehta)

- **Age:** 28 | **Domain:** Banking / Payments
- **Goal:** Get his payment issue resolved FAST
- **Frustration:** Submits ticket, hears nothing for hours
- **Needs:** Ticket receipt confirmation, estimated resolution time (SLA), real-time status tracking

### Persona 2 — Support Agent (Priya Sharma)

- **Age:** 26 | **Domain:** E-Commerce / Retail
- **Goal:** Resolve tickets correctly within deadlines
- **Frustration:** 80 tickets with no idea which to handle first, no SLA countdown visible
- **Needs:** Priority-sorted queue, SLA timers, breach alerts, easy status updates

### Persona 3 — Admin (Aakash Patel)

- **Age:** 34 | **Domain:** Healthcare
- **Goal:** Ensure critical issues resolved on time, configure rules, report SLA performance
- **Frustration:** No visibility into breaches, cannot configure rules without a developer
- **Needs:** Real-time SLA dashboard, UI-based rule configuration, user management, SLA reports

---

## 5. Business Requirements

| ID | Requirement | Priority |
|---|---|---|
| BR-01 | Support multiple tenants on one platform | Critical |
| BR-02 | Full data isolation between tenants | Critical |
| BR-03 | Support 4 industry domains | Critical |
| BR-04 | Configurable keyword-to-priority rules per domain | Critical |
| BR-05 | Configurable SLA policies per priority per domain | Critical |
| BR-06 | Support 3 user roles: Customer, Agent, Admin | Critical |
| BR-07 | Admin manages users without developer help | High |
| BR-08 | Automatic ticket prioritization without agent intervention | Critical |
| BR-09 | Automatic SLA breach detection and reporting | Critical |
| BR-10 | Analytics on SLA performance | High |

---

## 6. Functional Requirements

### 6.1 Authentication & Authorization

| ID | Requirement | Priority |
|---|---|---|
| FR-AUTH-01 | Register with name, email, password, domain, role | Critical |
| FR-AUTH-02 | Login with email and password | Critical |
| FR-AUTH-03 | JWT token issued on login (7-day expiry) | Critical |
| FR-AUTH-04 | All routes except login/register require valid token | Critical |
| FR-AUTH-05 | Role-based route access enforcement | Critical |
| FR-AUTH-06 | View and update own profile | High |
| FR-AUTH-07 | Admin can activate/deactivate users | High |

### 6.2 Ticket Management

| ID | Requirement | Priority |
|---|---|---|
| FR-TKT-01 | Customer submits ticket with title, description, category, priority | Critical |
| FR-TKT-02 | Auto-generate unique ticket number (TKT-XXXXX) | Critical |
| FR-TKT-03 | Run priority engine on every new ticket | Critical |
| FR-TKT-04 | Calculate and store SLA deadline on creation | Critical |
| FR-TKT-05 | Customer sees their submitted tickets | Critical |
| FR-TKT-06 | Agent sees assigned tickets sorted by finalPriority | Critical |
| FR-TKT-07 | Agent updates ticket status | Critical |
| FR-TKT-08 | Agent adds internal notes (not visible to customer) | High |
| FR-TKT-09 | Both add comments on a ticket | High |
| FR-TKT-10 | Admin views all tickets, overrides priority, assigns to agents | Critical |
| FR-TKT-11 | Status flow: Open → In Progress → Resolved → Closed | Critical |

### 6.3 Priority Engine

| ID | Requirement | Priority |
|---|---|---|
| FR-PE-01 | Scan title and description for domain keywords | Critical |
| FR-PE-02 | Assign systemPriority based on highest matching rule | Critical |
| FR-PE-03 | Override to finalPriority if systemPriority > userPriority | Critical |
| FR-PE-04 | Default to userPriority if no keyword matches | Critical |
| FR-PE-05 | Domain-specific rules — no cross-domain firing | Critical |
| FR-PE-06 | Admin CRUD for keyword rules from UI | Critical |

### 6.4 SLA Monitoring

| ID | Requirement | Priority |
|---|---|---|
| FR-SLA-01 | Calculate slaDeadline using SLA policy for finalPriority | Critical |
| FR-SLA-02 | Cron job checks for breaches every 60 seconds | Critical |
| FR-SLA-03 | Auto-flag slaBreached: true for overdue tickets | Critical |
| FR-SLA-04 | Notification created for agent on breach | Critical |
| FR-SLA-05 | Real-time SLA countdown ring timer on tickets | Critical |
| FR-SLA-06 | SLA Monitor page: breached, at-risk, and safe views | Critical |
| FR-SLA-07 | Admin configures resolution time per priority level | Critical |

### 6.5 Notifications

| ID | Requirement | Priority |
|---|---|---|
| FR-NOT-01 | Agent notified on new ticket assignment | High |
| FR-NOT-02 | Agent notified on SLA breach | Critical |
| FR-NOT-03 | Customer notified on status change | High |
| FR-NOT-04 | Unread notification count in navbar | Medium |
| FR-NOT-05 | Mark notifications as read | Medium |

---

## 7. Non-Functional Requirements

### Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-PERF-01 | API response time for ticket list | < 500ms |
| NFR-PERF-02 | API response time for ticket creation | < 1000ms |
| NFR-PERF-03 | SLA cron job execution time | < 5 seconds per run |
| NFR-PERF-04 | Frontend initial page load time | < 3 seconds |

### Security

| ID | Requirement |
|---|---|
| NFR-SEC-01 | Passwords hashed with bcrypt (12 salt rounds) |
| NFR-SEC-02 | JWT in httpOnly cookies |
| NFR-SEC-03 | tenantId filter on every database query |
| NFR-SEC-04 | All API inputs validated and sanitized |
| NFR-SEC-05 | CORS restricted to registered frontend origin |
| NFR-SEC-06 | Auth endpoints rate-limited |

### Usability

| ID | Requirement |
|---|---|
| NFR-USE-01 | Fully responsive (mobile, tablet, desktop) |
| NFR-USE-02 | Consistent priority color badges across all pages |
| NFR-USE-03 | SLA ring timer visible on every ticket |
| NFR-USE-04 | Inline form validation errors |
| NFR-USE-05 | Loading states during all API calls |

---

## 8. System Constraints

### Technical Constraints

| Constraint | Detail |
|---|---|
| Stack | MERN only |
| Database | MongoDB only |
| Authentication | JWT only (no OAuth for MVP) |
| Styling | Tailwind CSS |
| State | React Context API (no Redux) |
| Deployment | Free tier (Vercel + Render + MongoDB Atlas) |

### Project Constraints

| Constraint | Detail |
|---|---|
| Team | Single developer (student project) |
| Timeline | 6 weeks build time |
| Budget | Zero — all free tier |
| Scope | MVP only |

### Known MVP Limitations

| Limitation | Mitigation |
|---|---|
| No WebSockets | Page auto-refresh every 30 seconds |
| No email notifications | In-app notification bell |
| No file attachments | Paste image URLs in description |
| Free tier Render sleeps | Show loading state |

---

## 9. Success Metrics

### MVP Success Metrics

| Metric | Target |
|---|---|
| Priority engine accuracy | 95%+ correct on test tickets |
| SLA breach detection | 100% flagged within 60 seconds |
| Role access enforcement | 0 unauthorized access incidents |
| Page load time | All pages < 3 seconds |
| Full flow completion | Customer → Agent → Admin end-to-end |
| All 22 pages functional | 100% built and working |

---

*TicketIQ © 2026 — Software Engineering Subject Project*
