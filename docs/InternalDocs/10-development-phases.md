# TicketIQ — 10. Development Phases

> **Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document ID | 10-development-phases |
| Version | 1.0.0 |
| Total Duration | 6 Weeks |
| Phases | 5 |
| Date | March 2026 |

---

## Phase Overview

| Phase | Name | Duration | Goal |
|---|---|---|---|
| 1 | Foundation | Week 1 | Working backend with auth + basic ticket CRUD |
| 2 | Core Intelligence | Week 2 | Domain rules engine + SLA calculation working |
| 3 | Complete Backend | Week 3 | All 23 API endpoints complete and tested |
| 4 | Frontend Build | Week 4–5 | All 22 pages built and connected to backend |
| 5 | Integration & Testing | Week 6 | End-to-end testing + deployment |

---

## Phase 1 — Foundation (Week 1)

**Goal:** Working backend with authentication and basic ticket CRUD

### Tasks

- [ ] Initialize Node.js project (`npm init`)
- [ ] Install backend dependencies (express, mongoose, jsonwebtoken, bcryptjs, cors, dotenv, cookie-parser)
- [ ] Create `server.js` with Express app
- [ ] Create `config/db.js` — MongoDB Atlas connection via Mongoose
- [ ] Create `models/User.js` — User schema with bcrypt pre-save hook
- [ ] Create `models/Ticket.js` — Ticket schema with indexes
- [ ] Create `middleware/authMiddleware.js` — JWT verification
- [ ] Create `middleware/roleMiddleware.js` — Role-based access guard
- [ ] Create `utils/apiResponse.js` — Standard response format
- [ ] Build `controllers/authController.js` — register, login, getMe
- [ ] Build `routes/authRoutes.js` — wire up auth endpoints
- [ ] Build basic `controllers/ticketController.js` — create, getAll, getOne
- [ ] Build `routes/ticketRoutes.js` — wire up ticket endpoints
- [ ] Test all endpoints with Postman

### Deliverables

| Deliverable | Verification |
|---|---|
| Express server starts on PORT 5000 | `npm run dev` → "Server running" |
| MongoDB connects successfully | "MongoDB Connected" log |
| User can register | POST /api/auth/register → 201 |
| User can login | POST /api/auth/login → 200 + JWT |
| Protected routes work | GET /api/auth/me → 200 (with token) |
| Ticket can be created | POST /api/tickets → 201 |
| Tickets can be listed | GET /api/tickets → 200 |

---

## Phase 2 — Core Intelligence (Week 2)

**Goal:** Domain rules engine and SLA calculation fully functional

### Tasks

- [ ] Create `models/Domain.js` — Domain rules schema
- [ ] Create `models/SLAPolicy.js` — SLA policy schema
- [ ] Create `models/Notification.js` — Notification schema
- [ ] Build `services/priorityEngine.js` — keyword matching engine
- [ ] Integrate priority engine into `ticketController.createTicket()`
- [ ] Build SLA deadline calculation logic in ticket controller
- [ ] Create `seeds/seedData.js` — default rules for 4 domains + SLA policies
- [ ] Run seed script to populate default data
- [ ] Build `services/slaMonitor.js` — cron job (every 60 seconds)
- [ ] Integrate SLA monitor startup in `server.js`
- [ ] Test priority engine with various ticket texts
- [ ] Test SLA breach detection with expired deadline tickets

### Deliverables

| Deliverable | Verification |
|---|---|
| Priority engine matches keywords | "payment failed" → CRITICAL (Banking) |
| System overrides user priority | User=LOW, Engine=CRITICAL → Final=CRITICAL |
| SLA deadline calculated | CRITICAL ticket → deadline = now + 60min |
| Default rules seeded | 4 domains × 7-8 rules each in DB |
| SLA policies seeded | 4 priorities × 4 domains in DB |
| Cron job detects breaches | Expired ticket → slaBreached=true |
| Notification created on breach | Notification doc in DB for agent |

---

## Phase 3 — Complete Backend (Week 3)

**Goal:** All API endpoints complete, tested, and role-protected

### Tasks

- [ ] Build `controllers/domainController.js` — getDomain, addRule, updateRule, deleteRule
- [ ] Build `routes/domainRoutes.js` — domain CRUD endpoints
- [ ] Build `controllers/slaController.js` — getPolicies, createPolicy, updatePolicy, getReports
- [ ] Build `routes/slaRoutes.js` — SLA endpoints
- [ ] Build `controllers/userController.js` — getUsers, getUser, updateUser, toggleActive, deleteUser
- [ ] Build `routes/userRoutes.js` — user management endpoints
- [ ] Build `controllers/notificationController.js` — getNotifications, markAllRead
- [ ] Build `routes/notificationRoutes.js` — notification endpoints
- [ ] Add ticket status update endpoint (PATCH /:id/status)
- [ ] Add ticket assignment endpoint (PATCH /:id/assign)
- [ ] Add priority override endpoint (PATCH /:id/priority)
- [ ] Add comment endpoint (POST /:id/comment)
- [ ] Add internal note endpoint (POST /:id/note)
- [ ] Add SLA breached tickets endpoint (GET /sla/breached)
- [ ] Add SLA at-risk tickets endpoint (GET /sla/atrisk)
- [ ] Ensure role middleware on all protected routes
- [ ] Add centralized error handler in server.js
- [ ] Create full Postman collection and test all 23 endpoints

### Deliverables

| Deliverable | Verification |
|---|---|
| All 23 endpoints functional | Postman collection passes |
| Role access enforced | Customer → admin route = 403 |
| Domain rules CRUD works | Admin adds rule → next ticket uses it |
| SLA policies editable | Admin changes time → new tickets use it |
| User management works | Admin toggles active → user can't login |
| Notifications created | SLA breach → notification in DB |

---

## Phase 4 — Frontend Build (Week 4–5)

**Goal:** All 22 pages built, styled, and connected to backend

### Week 4: Setup + Auth + Customer + Components

- [ ] Initialize React project with Vite
- [ ] Install dependencies (react-router-dom, axios, tailwindcss, recharts, lucide-react, react-hook-form)
- [ ] Configure Tailwind CSS with custom design tokens (Midnight Navy + Gold theme)
- [ ] Create `api/axiosInstance.js` with interceptors
- [ ] Build `context/AuthContext.jsx` — login, logout, user state, auto-load
- [ ] Build `context/NotificationContext.jsx` — polling notifications
- [ ] Build `routes/PrivateRoute.jsx` and `routes/RoleRoute.jsx`
- [ ] Build shared components:
  - [ ] `Navbar.jsx` — top bar with notification bell
  - [ ] `Sidebar.jsx` — role-aware navigation
  - [ ] `PriorityBadge.jsx` — color-coded priority
  - [ ] `StatusBadge.jsx` — color-coded status
  - [ ] `SLARingTimer.jsx` — SVG countdown timer
  - [ ] `StatsCard.jsx` — dashboard metric card
  - [ ] `LoadingSpinner.jsx`
  - [ ] `ConfirmDialog.jsx`
- [ ] Build auth pages: Login, Register, ForgotPassword
- [ ] Build customer pages: Dashboard, SubmitTicket, TicketDetail, TicketHistory, Profile
- [ ] Connect all pages to backend API

### Week 5: Agent + Admin Pages

- [ ] Build agent pages:
  - [ ] Agent Dashboard (stats + urgent tickets)
  - [ ] Ticket Queue (priority-sorted, filterable)
  - [ ] Ticket Detail (status update, notes, comments)
  - [ ] SLA Monitor (three-lane view: breached/at-risk/safe)
  - [ ] Notifications page
  - [ ] Profile page
- [ ] Build admin pages:
  - [ ] Admin Dashboard (system stats + all tickets)
  - [ ] Manage Tickets (all tickets with filters)
  - [ ] Domain Configuration (rule CRUD interface)
  - [ ] SLA Settings (policy editor table)
  - [ ] User Management (user list + activate/deactivate)
  - [ ] SLA Reports (analytics with metrics)
  - [ ] Notifications page
  - [ ] Tenant Settings page
- [ ] Handle loading states, error states, empty states on all pages
- [ ] Ensure responsive design (mobile, tablet, desktop)

### Deliverables

| Deliverable | Verification |
|---|---|
| 22 pages built and styled | Visual inspection |
| All pages connected to API | Data loads from backend |
| Auth flow works | Register → Login → Dashboard |
| Ticket flow works | Submit → Queue → Detail → Resolve |
| SLA timer works | Real-time countdown on tickets |
| Responsive layout | Mobile, tablet, desktop views |

---

## Phase 5 — Integration & Testing (Week 6)

**Goal:** End-to-end testing, bug fixes, polish, and deployment

### Tasks

- [ ] Full user flow test: Customer → Submit ticket → Agent → Resolve → Admin → Report
- [ ] Test priority engine with all 4 domains
- [ ] Test priority override scenarios (user vs system)
- [ ] Test SLA breach detection with various ticket ages
- [ ] Test role-based access for all 3 roles
- [ ] Test tenant isolation (no cross-tenant data)
- [ ] Fix all identified bugs and edge cases
- [ ] Polish UI (spacing, colors, animations, transitions)
- [ ] Add confirmation dialogs for destructive actions
- [ ] Verify responsive layout on all breakpoints
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render
- [ ] Configure environment variables on Vercel + Render
- [ ] Configure CORS for production domain
- [ ] Test deployed application end-to-end
- [ ] Create demo data for presentation

### Deliverables

| Deliverable | Verification |
|---|---|
| Full flow works end-to-end | Customer → Agent → Admin |
| Priority engine accurate | 95%+ correct on test cases |
| SLA detection reliable | 100% breaches flagged within 60s |
| Deployed and accessible | Live URLs working |
| Demo-ready | Sample data populated |

---

## Timeline Summary

```
Week 1: [████████] Foundation — Server + Auth + Basic Ticket CRUD
Week 2: [████████] Core Intelligence — Priority Engine + SLA Monitor
Week 3: [████████] Complete Backend — All 23 Endpoints
Week 4: [████████] Frontend (Part 1) — Setup + Auth + Customer Pages
Week 5: [████████] Frontend (Part 2) — Agent + Admin Pages
Week 6: [████████] Integration — Testing + Bug Fixes + Deployment
```

---

*TicketIQ © 2026 — Software Engineering Subject Project*
