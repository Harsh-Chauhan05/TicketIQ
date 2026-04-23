# TicketIQ — 09. Engineering Scope Definition

> **Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document ID | 09-engineering-scope-definition |
| Version | 1.0.0 |
| Scope | MVP (Minimum Viable Product) |
| Timeline | 6 Weeks |
| Date | March 2026 |

---

## 1. Project Scope Overview

### 1.1 In-Scope (MVP Must-Build)

| # | Feature | Category | Priority |
|---|---|---|---|
| 1 | User registration & login (JWT) | Auth | Critical |
| 2 | Role-based access (Customer, Agent, Admin) | Auth | Critical |
| 3 | Ticket submission with category & priority | Tickets | Critical |
| 4 | Domain rules engine (auto-priority) | Engine | Critical |
| 5 | Priority validation (system overrides user) | Engine | Critical |
| 6 | SLA deadline calculation on ticket creation | SLA | Critical |
| 7 | SLA cron job (breach detection every 60s) | SLA | Critical |
| 8 | SLA breach flag on tickets | SLA | Critical |
| 9 | Customer dashboard (view own tickets) | Frontend | Critical |
| 10 | Agent ticket queue (sorted by priority) | Frontend | Critical |
| 11 | Agent SLA monitor (breach/at-risk/safe) | Frontend | Critical |
| 12 | Admin dashboard (stats overview) | Frontend | Critical |
| 13 | Admin domain rule configuration | Frontend | Critical |
| 14 | Admin SLA policy settings | Frontend | Critical |
| 15 | Ticket status updates lifecycle | Tickets | Critical |
| 16 | In-app notifications (SLA breach alerts) | Notifications | Critical |
| 17 | Multi-tenant data isolation (tenantId) | Architecture | Critical |
| 18 | SLA ring timer component | Frontend | Critical |
| 19 | User management (admin) | Admin | High |
| 20 | Ticket comments (customer + agent) | Tickets | High |
| 21 | Internal notes (agent only) | Tickets | High |
| 22 | SLA performance reports | Admin | High |

### 1.2 Out-of-Scope (Post-MVP)

| Feature | Reason Deferred |
|---|---|
| Email notifications | Requires email service (SendGrid/Brevo) |
| File attachments on tickets | Requires file storage (S3/Cloudinary) |
| Real-time updates (WebSockets) | Adds complexity; polling works for MVP |
| Password reset via email | Deferred with email service |
| Advanced analytics (charts/graphs) | Nice to have, not core |
| Mobile native app | Web app sufficient for MVP |
| Bulk ticket operations | Not critical for demo |
| Agent performance scoring | Post-MVP analytics |
| Custom branding per tenant | Enterprise feature |
| API rate limiting per tenant | Scaling feature |
| AI/ML-powered priority suggestion | Future enhancement |
| Ticket merging (duplicates) | Complex feature |

---

## 2. Technical Scope

### 2.1 Backend Scope

| Component | Deliverables |
|---|---|
| Models | 5 Mongoose schemas (User, Ticket, Domain, SLAPolicy, Notification) |
| Controllers | 6 controllers (auth, ticket, domain, sla, user, notification) |
| Routes | 6 route modules with 23 total endpoints |
| Middleware | 2 middleware (auth + role) |
| Services | 2 services (priorityEngine + slaMonitor) |
| Utilities | 1 utility (apiResponse) |
| Seeds | Default domain rules + SLA policies for 4 domains |
| Entry Point | server.js with middleware pipeline |

### 2.2 Frontend Scope

| Component | Deliverables |
|---|---|
| Pages | 22 pages across 4 sections (auth, customer, agent, admin) |
| Components | 9 reusable components |
| Context | 2 context providers (Auth + Notification) |
| API Layer | 7 API modules with axios |
| Routes | 2 route guards (PrivateRoute + RoleRoute) |
| Utils | 2 utility modules (priorityColors + slaHelpers) |

### 2.3 Pages Breakdown

| Section | Count | Pages |
|---|---|---|
| Auth | 3 | Login, Register, Forgot Password |
| Customer | 5 | Dashboard, Submit Ticket, Ticket Detail, Ticket History, Profile |
| Agent | 6 | Dashboard, Ticket Queue, Ticket Detail, SLA Monitor, Notifications, Profile |
| Admin | 8 | Dashboard, Manage Tickets, Domain Config, SLA Settings, User Management, SLA Reports, Notifications, Tenant Settings |
| **Total** | **22** | |

---

## 3. Engineering Deliverables

### 3.1 Backend Deliverables

- [ ] Express server with middleware pipeline (CORS, JSON, cookies, auth, roles)
- [ ] MongoDB connection via Mongoose with 5 schemas
- [ ] JWT-based authentication (register, login, protected routes)
- [ ] Role-based authorization middleware
- [ ] 23 REST API endpoints fully functional
- [ ] Priority engine service with domain-specific keyword matching
- [ ] SLA monitoring cron job (60-second cycle)
- [ ] Notification creation on SLA breach
- [ ] Seed script for default domain rules and SLA policies
- [ ] Standardized API response format
- [ ] Centralized error handling
- [ ] Multi-tenant data isolation via tenantId

### 3.2 Frontend Deliverables

- [ ] Vite + React 18 + Tailwind CSS project setup
- [ ] Dark-themed UI (Midnight Navy + Gold design system)
- [ ] AuthContext with login/logout/auto-load
- [ ] NotificationContext with polling
- [ ] PrivateRoute and RoleRoute guards
- [ ] 22 functional pages connected to backend
- [ ] SLA ring timer component (SVG, real-time, color-coded)
- [ ] Priority and status badge components
- [ ] Responsive layout (mobile, tablet, desktop)
- [ ] Form validation with inline errors
- [ ] Loading and error states on all pages
- [ ] Confirmation dialogs for destructive actions

### 3.3 Infrastructure Deliverables

- [ ] MongoDB Atlas cluster (free M0 tier)
- [ ] Vercel deployment for frontend
- [ ] Render deployment for backend
- [ ] Environment variables configured on all platforms
- [ ] CORS properly configured for production
- [ ] GitHub repository with proper .gitignore

---

## 4. Constraints & Boundaries

### 4.1 Technical Constraints

| Constraint | Boundary |
|---|---|
| Stack | MERN only — no additional frameworks |
| Database | MongoDB only — no SQL databases |
| Auth | JWT only — no OAuth/social login |
| Styling | Tailwind CSS only |
| State management | React Context only — no Redux |
| Hosting | Free tier only (Vercel + Render + Atlas M0) |

### 4.2 Project Constraints

| Constraint | Boundary |
|---|---|
| Developer | Single developer (student project) |
| Timeline | 6 weeks total |
| Budget | Zero cost |
| Scope | MVP features only |
| Data volume | ~10,000 tickets (sufficient for demo) |
| Storage | 512MB MongoDB Atlas free tier |

### 4.3 Known Limitations

| Limitation | Impact | Mitigation |
|---|---|---|
| No WebSocket support | No real-time push | Auto-refresh every 30 seconds |
| No email notifications | Agents miss alerts outside app | In-app notification bell |
| No file attachments | Cannot upload screenshots | Image URLs in description |
| Render free tier sleeps | Cold start ~30 seconds | Loading indicator |
| Atlas free tier 512MB | Limited data volume | Sufficient for project demo |

---

## 5. Definition of Done

### A feature is "DONE" when:

1. **Code complete** — Feature is implemented in both backend and frontend
2. **API tested** — Endpoint tested via Postman/Thunder Client
3. **Role-tested** — Verified correct access for all 3 roles
4. **Tenant-isolated** — tenantId filter applied on all DB queries
5. **Error handled** — Validation errors, 401/403/404/500 responses handled
6. **UI polished** — Loading states, empty states, error messages displayed
7. **Responsive** — Works on mobile, tablet, and desktop breakpoints

### The MVP is "COMPLETE" when:

- [ ] All 22 pages are built and functional
- [ ] Full user flow works: Customer → Submit → Agent → Resolve → Admin → Report
- [ ] Priority engine correctly assigns priority for all 4 domains
- [ ] SLA monitoring detects breaches within 60 seconds
- [ ] Role-based access prevents unauthorized actions
- [ ] Frontend is deployed on Vercel
- [ ] Backend is deployed on Render
- [ ] Database is on MongoDB Atlas

---

## 6. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cron job misses breaches | Low | High | Test with bulk tickets, async processing |
| Priority engine returns wrong priority | Medium | High | Unit test with edge cases |
| Cross-tenant data leak | Low | Critical | Always include tenantId in queries |
| JWT not invalidated on deactivation | Medium | High | Check isActive in authMiddleware |
| MongoDB free tier limit | Low | Medium | Monitor usage, archive old tickets |
| Render cold starts | High | Low | Loading indicator, document behavior |

---

*TicketIQ © 2026 — Software Engineering Subject Project*
