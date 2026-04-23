# TicketIQ — MVP Technical Document

> **Minimum Viable Product Specification for Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document Type | MVP Technical Document |
| Version | 1.0.0 |
| Tech Stack | MERN (MongoDB, Express, React, Node.js) |
| Project Type | Software Engineering Subject Project |
| MVP Target | Core ticket flow + SLA monitoring + domain rules |
| Date | March 2026 |

---

## Table of Contents

1. [What is the MVP](#1-what-is-the-mvp)
2. [MVP Scope — What's IN and OUT](#2-mvp-scope--whats-in-and-out)
3. [MVP User Stories](#3-mvp-user-stories)
4. [MVP Features Breakdown](#4-mvp-features-breakdown)
5. [MVP Pages Included](#5-mvp-pages-included)
6. [MVP Data Models](#6-mvp-data-models)
7. [MVP API Endpoints](#7-mvp-api-endpoints)
8. [MVP Domain Rules Engine](#8-mvp-domain-rules-engine)
9. [MVP SLA Monitoring](#9-mvp-sla-monitoring)
10. [MVP Tech Implementation Plan](#10-mvp-tech-implementation-plan)
11. [MVP Build Phases](#11-mvp-build-phases)
12. [MVP Acceptance Criteria](#12-mvp-acceptance-criteria)
13. [Post-MVP Features](#13-post-mvp-features)

---

## 1. What is the MVP

The MVP (Minimum Viable Product) of TicketIQ is the smallest working version of the system that demonstrates all core features required to prove the concept. It is the version that should be submitted as a **software engineering project** while being complete enough to present as a real product.

### 1.1 MVP Goal

> Build a working MERN application where a customer can submit a support ticket, the system auto-assigns priority using domain rules, an agent can resolve it, and the admin can monitor SLA deadlines — all within one working system.

### 1.2 MVP Success Statement

The MVP is considered successful when:

- A customer submits a ticket and the system **automatically assigns the correct priority** based on the business domain
- An agent can **view, claim, and resolve** tickets in priority order
- The system **tracks SLA deadlines** and marks tickets as breached if not resolved in time
- An admin can **configure domain rules and SLA policies**
- All three roles have **separate dashboards** with relevant data
- The entire system is **role-protected** using JWT authentication

---

## 2. MVP Scope — What's IN and OUT

### 2.1 ✅ IN Scope (Must Build for MVP)

| Feature | Reason |
|---|---|
| User registration and login (JWT) | Core auth needed for all roles |
| Role-based access (Customer, Agent, Admin) | System cannot function without roles |
| Ticket submission with category and priority | Core ticket creation flow |
| Domain rules engine (auto-priority) | The main differentiator of TicketIQ |
| Priority validation (system overrides user) | Core business logic |
| SLA deadline calculation on ticket creation | Required for SLA monitoring |
| SLA cron job (breach detection every minute) | Core SLA feature |
| SLA breach flag on tickets | Required for reporting |
| Customer dashboard (view own tickets) | Customer must see their tickets |
| Agent ticket queue (sorted by priority) | Agent must work by priority |
| Agent SLA monitor (breach/at-risk view) | Core agent workflow |
| Admin dashboard (stats overview) | Admin needs system visibility |
| Admin domain rule configuration | Admin must be able to set rules |
| Admin SLA policy settings | Admin must configure SLA times |
| Ticket status updates (Open → In Progress → Resolved) | Core ticket lifecycle |
| Notifications (SLA breach alerts) | Agents must be alerted |
| Multi-tenant data isolation (tenantId) | Architectural requirement |

### 2.2 ❌ OUT of Scope (Post-MVP)

| Feature | Reason Deferred |
|---|---|
| Email notifications | Requires email service setup (SendGrid etc.) |
| File attachments on tickets | Requires file storage (AWS S3 etc.) |
| Real-time updates (WebSockets) | Adds complexity, polling works for MVP |
| Advanced analytics charts | Nice to have, not core functionality |
| Mobile app | Web app sufficient for MVP |
| Password reset via email | Deferred with email service |
| Bulk ticket operations | Not critical for MVP |
| Agent performance scoring | Post-MVP analytics feature |
| Custom branding per tenant | Post-MVP enterprise feature |
| API rate limiting per tenant | Post-MVP scaling feature |

---

## 3. MVP User Stories

### 3.1 Customer Stories

```
US-C01  As a customer, I want to register an account
        so that I can submit support tickets.

US-C02  As a customer, I want to log in
        so that I can access my support dashboard.

US-C03  As a customer, I want to submit a ticket with a title,
        description, and my chosen priority
        so that I can report an issue.

US-C04  As a customer, I want to see the system-assigned priority
        on my ticket so that I understand its urgency.

US-C05  As a customer, I want to view all my submitted tickets
        so that I can track their status.

US-C06  As a customer, I want to see the SLA deadline on my ticket
        so that I know when it will be resolved.

US-C07  As a customer, I want to add comments on my ticket
        so that I can provide more information.
```

### 3.2 Agent Stories

```
US-A01  As an agent, I want to see all tickets assigned to me
        sorted by priority so that I work on the most urgent first.

US-A02  As an agent, I want to update a ticket's status
        so that the customer knows progress is being made.

US-A03  As an agent, I want to see a live SLA countdown timer
        on each ticket so that I know how much time I have left.

US-A04  As an agent, I want to see which tickets have breached
        SLA so that I can escalate them immediately.

US-A05  As an agent, I want to add internal notes on a ticket
        so that I can document my investigation steps.

US-A06  As an agent, I want to receive a notification
        when an SLA deadline is about to be breached
        so that I can take action before it's too late.
```

### 3.3 Admin Stories

```
US-AD01 As an admin, I want to see a dashboard with total tickets,
        open tickets, SLA breach rate, and active agents
        so that I have a full system overview.

US-AD02 As an admin, I want to configure domain-specific rules
        (keyword → priority mappings)
        so that the system can auto-prioritize tickets correctly.

US-AD03 As an admin, I want to set SLA policies per priority level
        so that the system enforces the correct resolution times.

US-AD04 As an admin, I want to manage users (view, activate,
        deactivate, assign roles)
        so that I control who has access to the system.

US-AD05 As an admin, I want to view all tickets across all users
        with filters so that I have full visibility.

US-AD06 As an admin, I want to override a ticket's priority
        so that I can manually correct mis-prioritized tickets.
```

---

## 4. MVP Features Breakdown

### 4.1 Feature 1 — Authentication System

**Description:** Secure user registration and login using JWT tokens. Each user belongs to a tenant and has a role.

**Tech Implementation:**
- `POST /api/auth/register` — hash password with bcrypt, create user, return JWT
- `POST /api/auth/login` — verify credentials, return JWT
- JWT stored in `httpOnly` cookie on client
- `authMiddleware.js` verifies token on every protected route
- `roleMiddleware.js` checks user role for restricted routes

**Acceptance Criteria:**
- User can register with name, email, password, domain, and role
- User can log in and receive a valid JWT
- Invalid credentials return 401 error
- Protected routes return 403 if wrong role

---

### 4.2 Feature 2 — Ticket Submission

**Description:** Customers submit tickets with title, description, category, and their chosen priority. The system validates and may override the priority.

**Tech Implementation:**
- `POST /api/tickets` — creates ticket, triggers priority engine, calculates SLA deadline
- `priorityEngine.js` scans title + description against domain rules
- `systemPriority` set by engine, `finalPriority` = max(userPriority, systemPriority)
- `slaDeadline` = `createdAt + resolutionTimeMin` from SLA policy

**Acceptance Criteria:**
- Customer can submit ticket with all required fields
- System assigns `systemPriority` automatically
- If system priority is higher than user's, `finalPriority` is overridden
- SLA deadline is calculated and stored at creation time
- Ticket is assigned a unique ticket number (e.g. `TKT-00042`)

---

### 4.3 Feature 3 — Domain Rules Engine

**Description:** The intelligence core of TicketIQ. Matches ticket text against keyword rules defined per domain and returns the highest matching priority.

**Tech Implementation:**

```js
// services/priorityEngine.js
const assignPriority = async (ticket, tenantId) => {
  const domain = await Domain.findOne({ tenantId, name: ticket.domain });
  const text = `${ticket.title} ${ticket.description}`.toLowerCase();

  const priorityRank = { critical: 4, high: 3, medium: 2, low: 1 };
  let systemPriority = 'low';

  for (const rule of domain.rules) {
    const keywords = rule.keyword.split(',').map(k => k.trim().toLowerCase());
    for (const kw of keywords) {
      if (text.includes(kw)) {
        if (priorityRank[rule.priority] > priorityRank[systemPriority]) {
          systemPriority = rule.priority;
        }
      }
    }
  }

  const finalPriority =
    priorityRank[systemPriority] > priorityRank[ticket.userPriority]
      ? systemPriority
      : ticket.userPriority;

  return { systemPriority, finalPriority };
};
```

**Acceptance Criteria:**
- Engine correctly identifies priority from ticket text
- Multiple keyword matches return the highest priority
- No keyword match defaults to `userPriority`
- Engine is domain-specific (banking rules don't apply to ecommerce tickets)

---

### 4.4 Feature 4 — SLA Monitoring

**Description:** Background cron job checks every minute for tickets that have exceeded their SLA deadline and marks them as breached.

**Tech Implementation:**

```js
// services/slaMonitor.js
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const breached = await Ticket.find({
    status: { $in: ['open', 'in_progress'] },
    slaDeadline: { $lt: now },
    slaBreached: false
  });
  for (const ticket of breached) {
    ticket.slaBreached = true;
    await ticket.save();
    await Notification.create({
      tenantId: ticket.tenantId,
      userId: ticket.assignedTo,
      type: 'sla_breach',
      ticketId: ticket._id,
      message: `SLA breached: ${ticket.ticketNumber}`,
    });
  }
});
```

**Acceptance Criteria:**
- Cron job runs every 60 seconds
- Tickets past `slaDeadline` are flagged `slaBreached: true`
- Notification is created for the assigned agent
- Already breached tickets are not processed again

---

### 4.5 Feature 5 — Role-Based Dashboards

**Description:** Each role gets a tailored dashboard showing only relevant data.

| Role | Dashboard Shows |
|---|---|
| Customer | My tickets, open count, resolved count, SLA status |
| Agent | Assigned tickets sorted by priority, SLA breach alerts, SLA ring timers |
| Admin | Total tickets, active agents, SLA breach rate, all tickets table |

---

### 4.6 Feature 6 — Admin Configuration

**Description:** Admin can manage the domain rules engine and SLA policies from the UI without touching code.

**Domain Rules Config:**
- View all keyword → priority rules for the domain
- Add new rule (keyword input + priority dropdown)
- Edit existing rule
- Delete rule

**SLA Policy Config:**
- View SLA table per priority level
- Edit response time and resolution time per priority
- Changes take effect on all new tickets immediately

---

## 5. MVP Pages Included

### 5.1 Auth Pages (3 pages)

| # | Page | Route | Status |
|---|---|---|---|
| 1 | Login | `/login` | ✅ MVP |
| 2 | Register | `/register` | ✅ MVP |
| 3 | Forgot Password | `/forgot-password` | ✅ MVP |

### 5.2 Customer Pages (5 pages)

| # | Page | Route | Status |
|---|---|---|---|
| 4 | Customer Dashboard | `/customer/dashboard` | ✅ MVP |
| 5 | Submit Ticket | `/customer/submit` | ✅ MVP |
| 6 | Ticket Detail | `/customer/tickets/:id` | ✅ MVP |
| 7 | Ticket History | `/customer/tickets` | ✅ MVP |
| 8 | Profile | `/customer/profile` | ✅ MVP |

### 5.3 Agent Pages (6 pages)

| # | Page | Route | Status |
|---|---|---|---|
| 9 | Agent Dashboard | `/agent/dashboard` | ✅ MVP |
| 10 | Ticket Queue | `/agent/queue` | ✅ MVP |
| 11 | Ticket Detail | `/agent/tickets/:id` | ✅ MVP |
| 12 | SLA Monitor | `/agent/sla-monitor` | ✅ MVP |
| 13 | Notifications | `/agent/notifications` | ✅ MVP |
| 14 | Profile | `/agent/profile` | ✅ MVP |

### 5.4 Admin Pages (8 pages)

| # | Page | Route | Status |
|---|---|---|---|
| 15 | Admin Dashboard | `/admin/dashboard` | ✅ MVP |
| 16 | Manage Tickets | `/admin/tickets` | ✅ MVP |
| 17 | Domain Configuration | `/admin/domain-config` | ✅ MVP |
| 18 | SLA Settings | `/admin/sla-settings` | ✅ MVP |
| 19 | User Management | `/admin/users` | ✅ MVP |
| 20 | SLA Reports | `/admin/reports` | ✅ MVP |
| 21 | Notifications | `/admin/notifications` | ✅ MVP |
| 22 | Tenant Settings | `/admin/settings` | ✅ MVP |

> **Total MVP Pages: 22**

---

## 6. MVP Data Models

### 6.1 Minimum Required Fields Per Model

#### User (minimum fields for MVP)

```js
{
  name       : String    // required
  email      : String    // unique, required
  password   : String    // bcrypt hashed
  role       : Enum      // 'customer' | 'agent' | 'admin'
  domain     : Enum      // 'banking' | 'ecommerce' | 'healthcare' | 'edtech'
  tenantId   : ObjectId  // for data isolation
  isActive   : Boolean   // default true
}
```

#### Ticket (minimum fields for MVP)

```js
{
  ticketNumber   : String    // auto TKT-XXXXX
  title          : String    // required
  description    : String    // required
  domain         : Enum      // required
  userPriority   : Enum      // what user selected
  systemPriority : Enum      // what engine assigned
  finalPriority  : Enum      // effective priority
  status         : Enum      // open | in_progress | resolved
  slaDeadline    : Date      // calculated at creation
  slaBreached    : Boolean   // default false
  createdBy      : ObjectId  // customer ref
  assignedTo     : ObjectId  // agent ref
  tenantId       : ObjectId  // isolation
  comments       : Array     // customer + agent messages
  internalNotes  : Array     // agent only
}
```

#### Domain (minimum fields for MVP)

```js
{
  name     : Enum    // domain type
  tenantId : ObjectId
  rules    : [{ keyword: String, priority: Enum }]
}
```

#### SLAPolicy (minimum fields for MVP)

```js
{
  tenantId          : ObjectId
  domain            : String
  priority          : Enum
  resolutionTimeMin : Number  // minutes to resolve
  escalateAfterMin  : Number  // minutes before alert
}
```

#### Notification (minimum fields for MVP)

```js
{
  tenantId  : ObjectId
  userId    : ObjectId   // recipient
  type      : Enum       // sla_breach | ticket_assigned | status_update
  ticketId  : ObjectId
  message   : String
  isRead    : Boolean    // default false
}
```

---

## 7. MVP API Endpoints

### Minimum endpoints required for all MVP features to work:

```
AUTH
POST   /api/auth/register           Register new user
POST   /api/auth/login              Login, get JWT
GET    /api/auth/me                 Get current user

TICKETS
POST   /api/tickets                 Create ticket (triggers engine + SLA calc)
GET    /api/tickets                 Get tickets (filtered by role/tenant)
GET    /api/tickets/:id             Get single ticket
PATCH  /api/tickets/:id/status      Update status (agent/admin)
PATCH  /api/tickets/:id/assign      Assign ticket to agent (admin)
PATCH  /api/tickets/:id/priority    Override priority (admin)
POST   /api/tickets/:id/comment     Add comment
POST   /api/tickets/:id/note        Add internal note (agent/admin)
GET    /api/tickets/sla/breached    Get breached tickets
GET    /api/tickets/sla/atrisk      Get tickets near breach

DOMAINS
GET    /api/domains                 Get domain rules
POST   /api/domains/rules           Add rule (admin)
PUT    /api/domains/rules/:id       Edit rule (admin)
DELETE /api/domains/rules/:id       Delete rule (admin)

SLA POLICIES
GET    /api/sla/policies            Get policies for tenant
POST   /api/sla/policies            Create policy (admin)
PUT    /api/sla/policies/:id        Update policy (admin)

USERS
GET    /api/users                   Get all users (admin)
PATCH  /api/users/:id               Update user (admin)
PATCH  /api/users/:id/toggle        Activate/deactivate (admin)

NOTIFICATIONS
GET    /api/notifications           Get my notifications
PATCH  /api/notifications/read-all  Mark all as read
```

> **Total MVP Endpoints: 23**

---

## 8. MVP Domain Rules Engine

### 8.1 Seed Data — Default Rules Per Domain

The following rules are seeded into the database when a new tenant registers. Admin can edit/add/delete rules at any time.

#### Banking Domain — Default Rules

```js
[
  { keyword: "payment failed, transaction failed, payment declined", priority: "critical" },
  { keyword: "account locked, account suspended, unauthorized access", priority: "critical" },
  { keyword: "money deducted, amount deducted, double charge", priority: "critical" },
  { keyword: "wrong balance, missing funds, balance incorrect", priority: "high" },
  { keyword: "cannot login, login failed, access denied", priority: "high" },
  { keyword: "card blocked, card declined", priority: "high" },
  { keyword: "statement incorrect, wrong statement", priority: "medium" },
  { keyword: "change address, update details, update email", priority: "low" },
]
```

#### E-Commerce Domain — Default Rules

```js
[
  { keyword: "order not delivered, package missing, never arrived", priority: "high" },
  { keyword: "refund not received, money not refunded, refund stuck", priority: "high" },
  { keyword: "payment stuck, payment pending, charged not delivered", priority: "high" },
  { keyword: "wrong item, incorrect product, damaged product", priority: "medium" },
  { keyword: "late delivery, delivery delayed", priority: "medium" },
  { keyword: "cancel order, order cancellation", priority: "medium" },
  { keyword: "change address, update order", priority: "low" },
  { keyword: "track order, where is my order", priority: "low" },
]
```

#### Healthcare Domain — Default Rules

```js
[
  { keyword: "system down, portal not loading, cannot access, server error", priority: "critical" },
  { keyword: "patient data missing, records not found, data lost", priority: "critical" },
  { keyword: "appointment not confirmed, booking failed", priority: "high" },
  { keyword: "prescription not available, medicine not found", priority: "high" },
  { keyword: "billing error, invoice wrong, charge incorrect", priority: "medium" },
  { keyword: "report not available, test result missing", priority: "medium" },
  { keyword: "update profile, change doctor", priority: "low" },
]
```

#### EdTech Domain — Default Rules

```js
[
  { keyword: "exam portal down, cannot submit exam, submission failed", priority: "critical" },
  { keyword: "quiz not saving, answers lost, exam crashed", priority: "critical" },
  { keyword: "certificate not received, certificate missing", priority: "high" },
  { keyword: "video not loading, lecture not playing", priority: "medium" },
  { keyword: "assignment not submitted, upload failed", priority: "medium" },
  { keyword: "payment not confirmed, enrollment failed", priority: "high" },
  { keyword: "course not visible, content missing", priority: "medium" },
  { keyword: "change password, update profile", priority: "low" },
]
```

---

## 9. MVP SLA Monitoring

### 9.1 Default SLA Policies (Seeded on Tenant Creation)

These are seeded for all domains. Admin can modify them per domain.

```js
const defaultSLAPolicies = [
  { priority: "critical", resolutionTimeMin: 60,   escalateAfterMin: 45  },
  { priority: "high",     resolutionTimeMin: 240,  escalateAfterMin: 180 },
  { priority: "medium",   resolutionTimeMin: 1440, escalateAfterMin: 1200 },
  { priority: "low",      resolutionTimeMin: 4320, escalateAfterMin: 3600 },
];
```

### 9.2 SLA Status Logic (Frontend)

```js
// utils/slaHelpers.js
export const getSLAStatus = (slaDeadline, slaBreached) => {
  if (slaBreached) return { status: 'breached', color: 'red', label: 'BREACHED' };

  const now = new Date();
  const deadline = new Date(slaDeadline);
  const totalMs = deadline - now;
  const totalMinutes = Math.floor(totalMs / 60000);

  if (totalMinutes < 0)  return { status: 'breached', color: 'red',    label: 'BREACHED' };
  if (totalMinutes < 30) return { status: 'critical', color: 'red',    label: `${totalMinutes}m left` };
  if (totalMinutes < 120)return { status: 'warning',  color: 'orange', label: `${totalMinutes}m left` };

  const hours = Math.floor(totalMinutes / 60);
  const mins  = totalMinutes % 60;
  return { status: 'safe', color: 'green', label: `${hours}h ${mins}m left` };
};
```

### 9.3 SLA Ring Timer Component (React)

```jsx
// components/SLARingTimer.jsx
const SLARingTimer = ({ slaDeadline, slaBreached, totalMinutes }) => {
  const { status, color, label } = getSLAStatus(slaDeadline, slaBreached);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const now = new Date();
  const remaining = Math.max(0, new Date(slaDeadline) - now);
  const total = totalMinutes * 60 * 1000;
  const progress = Math.min(remaining / total, 1);
  const strokeDashoffset = circumference * (1 - progress);

  const colorMap = { red: '#EF4444', orange: '#F59E0B', green: '#22C55E' };

  return (
    <div style={{ position: 'relative', width: 52, height: 52 }}>
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={radius} fill="none"
          stroke="#1E2D50" strokeWidth="4" />
        <circle cx="26" cy="26" r={radius} fill="none"
          stroke={colorMap[color]} strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 26 26)" />
      </svg>
      <span style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 9, fontWeight: 700, color: colorMap[color]
      }}>
        {label}
      </span>
    </div>
  );
};
```

---

## 10. MVP Tech Implementation Plan

### 10.1 Backend Setup Checklist

```
[ ] Initialize Node.js project (npm init)
[ ] Install dependencies:
      express mongoose jsonwebtoken bcryptjs
      node-cron cors dotenv express-validator
[ ] Create server.js with Express app
[ ] Connect MongoDB via mongoose in config/db.js
[ ] Create all 5 Mongoose models
[ ] Implement authMiddleware and roleMiddleware
[ ] Build authController (register, login, me)
[ ] Build ticketController with priorityEngine call
[ ] Build priorityEngine service
[ ] Build slaMonitor cron service
[ ] Build domainController (CRUD rules)
[ ] Build slaController (CRUD policies)
[ ] Build userController (list, update, toggle)
[ ] Build notificationController
[ ] Register all routes in server.js
[ ] Seed default domain rules and SLA policies
[ ] Test all endpoints with Postman or Thunder Client
```

### 10.2 Frontend Setup Checklist

```
[ ] Initialize React project (Vite)
[ ] Install dependencies:
      react-router-dom axios tailwindcss
      react-hook-form recharts lucide-react
[ ] Configure Tailwind CSS
[ ] Set up AuthContext (login, logout, user state)
[ ] Set up NotificationContext
[ ] Create PrivateRoute and RoleRoute wrappers
[ ] Build Navbar and Sidebar components
[ ] Build PriorityBadge component
[ ] Build SLARingTimer component
[ ] Build StatsCard component
[ ] Build all Auth pages (Login, Register)
[ ] Build all Customer pages (5 pages)
[ ] Build all Agent pages (6 pages)
[ ] Build all Admin pages (8 pages)
[ ] Connect all pages to backend via axios API calls
[ ] Handle loading states and error states
[ ] Test full user flow for all 3 roles
```

### 10.3 Environment Setup

```bash
# Initialize backend
mkdir ticketiq && cd ticketiq
mkdir server client

cd server
npm init -y
npm install express mongoose jsonwebtoken bcryptjs \
  node-cron cors dotenv express-validator

cd ../client
npm create vite@latest . -- --template react
npm install react-router-dom axios tailwindcss \
  postcss autoprefixer react-hook-form recharts lucide-react
npx tailwindcss init -p
```

---

## 11. MVP Build Phases

### Phase 1 — Foundation (Week 1)

```
Goal: Working backend with auth and basic ticket CRUD

Tasks:
  - Setup Node/Express server
  - Connect MongoDB Atlas
  - Create User and Ticket models
  - Build register/login with JWT
  - Basic ticket POST and GET endpoints
  - Test with Postman

Deliverable: Backend auth + ticket creation working
```

### Phase 2 — Core Intelligence (Week 2)

```
Goal: Domain rules engine + SLA calculation working

Tasks:
  - Create Domain and SLAPolicy models
  - Build priorityEngine.js service
  - Integrate engine into ticket creation
  - Build SLA deadline calculation
  - Seed default domain rules
  - Seed default SLA policies
  - Build slaMonitor.js cron job

Deliverable: Tickets auto-prioritized, SLA deadlines calculated
```

### Phase 3 — Complete Backend (Week 3)

```
Goal: All API endpoints complete and tested

Tasks:
  - Domain CRUD routes (admin)
  - SLA policy CRUD routes (admin)
  - User management routes (admin)
  - Notification creation on SLA breach
  - Role-based access on all routes
  - Ticket status update and assignment
  - Full Postman collection test

Deliverable: Full backend API ready for frontend
```

### Phase 4 — Frontend Build (Week 4-5)

```
Goal: All 22 pages built and connected to backend

Tasks:
  - Setup React + Vite + Tailwind
  - Build Auth pages (Login, Register)
  - Build shared components (Navbar, Sidebar, Badges, SLA Ring)
  - Build Customer pages (Dashboard, Submit, Detail, History)
  - Build Agent pages (Dashboard, Queue, Detail, SLA Monitor)
  - Build Admin pages (Dashboard, Config, Settings, Reports)
  - Connect all pages to API via axios

Deliverable: Full frontend working with real data
```

### Phase 5 — Integration & Testing (Week 6)

```
Goal: End-to-end testing of full system

Tasks:
  - Full user flow test (Customer → Agent → Admin)
  - Test priority override scenarios
  - Test SLA breach detection
  - Fix bugs and edge cases
  - Polish UI
  - Deploy to Vercel (frontend) + Render (backend)

Deliverable: Deployed, working MVP
```

---

## 12. MVP Acceptance Criteria

### 12.1 Auth System

- [ ] Customer can register with email, password, domain selection
- [ ] Customer can log in and access their dashboard
- [ ] Agent can log in and see a different dashboard than customer
- [ ] Admin can log in and see the admin dashboard
- [ ] Accessing a protected route without token returns 401
- [ ] Accessing an admin route as customer returns 403

### 12.2 Ticket Creation & Priority Engine

- [ ] Customer submits ticket with title containing "payment failed"
- [ ] System assigns `systemPriority: critical` automatically
- [ ] If customer selected `low`, `finalPriority` is overridden to `critical`
- [ ] SLA deadline is set to `createdAt + 60 minutes` for critical
- [ ] Ticket number is auto-generated (e.g. TKT-00001)
- [ ] Ticket appears in customer dashboard immediately

### 12.3 Agent Workflow

- [ ] Agent sees ticket queue sorted by finalPriority (CRITICAL first)
- [ ] Agent can update ticket status to `in_progress`
- [ ] Agent can update ticket status to `resolved`
- [ ] Agent can add internal notes
- [ ] SLA ring timer shows correct countdown on each ticket

### 12.4 SLA Monitoring

- [ ] Cron job runs and detects breached tickets
- [ ] Breached ticket gets `slaBreached: true` in database
- [ ] Notification is created for the assigned agent
- [ ] Agent sees the breach notification in notifications page
- [ ] SLA Monitor page shows breached vs at-risk vs safe tickets

### 12.5 Admin Configuration

- [ ] Admin can add a new domain rule (keyword + priority)
- [ ] New rule is immediately used for the next ticket submission
- [ ] Admin can edit SLA resolution time for HIGH priority
- [ ] New SLA time is used for the next ticket created with HIGH priority
- [ ] Admin can view all tickets with filters
- [ ] Admin can override a ticket's priority

---

## 13. Post-MVP Features

These features are NOT in MVP but should be tracked for future development.

| Feature | Priority | Estimated Effort |
|---|---|---|
| Email notifications on SLA breach | High | Medium |
| File attachments on tickets | High | Medium |
| Real-time updates via WebSockets | High | High |
| Password reset via email | Medium | Low |
| Advanced analytics charts | Medium | Medium |
| Bulk ticket operations | Medium | Low |
| Agent performance scoring & leaderboard | Medium | Medium |
| Custom SLA rules per ticket category | Medium | Medium |
| Mobile-responsive PWA | Low | High |
| Custom branding per tenant | Low | Medium |
| Ticket merging (duplicate detection) | Low | High |
| Customer satisfaction rating on resolution | Low | Low |
| AI-powered priority suggestion (ML model) | Future | Very High |

---

*TicketIQ © 2026 — Software Engineering Subject Project*
