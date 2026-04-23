# TicketIQ — System Architecture Document

> **Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document Type | System Architecture |
| Version | 1.0.0 |
| Tech Stack | MERN (MongoDB, Express, React, Node.js) |
| Project Type | Software Engineering Subject Project |
| Architecture Style | Multi-Tenant, RESTful, Domain-Adaptive |
| Date | March 2026 |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Technology Stack](#3-technology-stack)
4. [Project Folder Structure](#4-project-folder-structure)
5. [Database Schema Design](#5-database-schema-design)
6. [REST API Endpoints](#6-rest-api-endpoints)
7. [Domain-Adaptive Rules Engine](#7-domain-adaptive-rules-engine)
8. [SLA Monitoring System](#8-sla-monitoring-system)
9. [Security Architecture](#9-security-architecture)
10. [Role-Based Access Control](#10-role-based-access-control)
11. [Application Pages Summary](#11-application-pages-summary)
12. [Deployment Architecture](#12-deployment-architecture)
13. [Glossary](#13-glossary)

---

## 1. Introduction

TicketIQ is a domain-adaptive, multi-tenant customer support management platform built on the MERN stack. It automatically prioritizes incoming support tickets, validates user-assigned priorities, applies business-domain-specific rules, and monitors SLA (Service Level Agreement) deadlines in real time.

The system is designed to serve multiple enterprise clients simultaneously (multi-tenant), where each client operates in a specific industry domain such as Banking, E-Commerce, Healthcare, or EdTech. Each domain has its own rule set, SLA policies, agents, and data — fully isolated from other tenants.

### 1.1 Core Objectives

- Automatically classify and prioritize support tickets using domain-specific keyword rules
- Monitor SLA deadlines with real-time countdown timers and breach alerts
- Support role-based access for Customers, Support Agents, and Admins
- Enable domain configuration so each business can define its own rules and SLA policies
- Provide analytics dashboards for SLA performance tracking

### 1.2 Key Stakeholders

| Role | Responsibility |
|---|---|
| Customer | Submits tickets, tracks status and SLA countdown |
| Support Agent | Resolves assigned tickets, monitors SLA deadlines |
| Admin | Configures domain rules, SLA policies, manages users |
| System | Auto-prioritizes tickets, triggers SLA breach alerts |

---

## 2. System Overview

TicketIQ follows a client-server architecture where the React frontend communicates with a Node.js/Express backend via RESTful APIs. MongoDB serves as the persistent data store. The system is organized around the concept of Tenants — each business that subscribes to TicketIQ gets an isolated environment.

### 2.1 High-Level Architecture

```
[ React Frontend (SPA) ]
        |  HTTP REST API calls (axios)
        v
[ Node.js + Express Backend ]
   |-- Auth Middleware (JWT)
   |-- Role-Based Access Control
   |-- Domain Rules Engine
   |-- SLA Monitoring Service (cron jobs)
        |
        v
[ MongoDB Database ]
   |-- Users Collection
   |-- Tickets Collection
   |-- Domains Collection
   |-- SLA Policies Collection
   |-- Notifications Collection
```

### 2.2 Architecture Decisions

| Attribute | Decision |
|---|---|
| Architecture Pattern | Monolithic MERN with service separation |
| API Style | RESTful HTTP APIs (JSON) |
| Authentication | JWT (JSON Web Tokens) with role-based access |
| Multi-Tenancy | Tenant ID on every document (logical isolation) |
| SLA Monitoring | Node.js cron jobs (node-cron) running every minute |
| State Management | React Context API + useState/useReducer |
| Deployment | Single server (scalable to microservices) |

---

## 3. Technology Stack

### 3.1 Frontend

| Technology | Purpose |
|---|---|
| React.js (v18) | UI component library, SPA routing |
| React Router v6 | Client-side page navigation |
| Axios | HTTP API calls to backend |
| React Context API | Global state (auth, user, notifications) |
| Tailwind CSS | Utility-first styling |
| Recharts | SLA charts, analytics dashboards |
| React Hook Form | Ticket submission and settings forms |
| Lucide React | Icons throughout the UI |

### 3.2 Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime for server |
| Express.js | REST API framework, middleware pipeline |
| Mongoose | MongoDB ODM for schema definitions |
| JWT (jsonwebtoken) | Stateless authentication tokens |
| bcryptjs | Password hashing |
| node-cron | Scheduled SLA monitoring jobs |
| express-validator | Request input validation |
| cors | Cross-origin request handling |
| dotenv | Environment variable management |

### 3.3 Database

| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud NoSQL database |
| Mongoose Schemas | Structured document models with validation |
| Indexes | On tenantId, ticketId, userId for fast queries |
| TTL Index | Auto-expire resolved tickets from active view |

---

## 4. Project Folder Structure

### 4.1 Frontend Structure (React)

```
client/
├── public/
├── src/
│   ├── api/                    # axios API call functions
│   │   ├── auth.js
│   │   ├── tickets.js
│   │   ├── domains.js
│   │   └── sla.js
│   ├── components/             # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── PriorityBadge.jsx
│   │   ├── SLARingTimer.jsx
│   │   ├── TicketCard.jsx
│   │   └── StatsCard.jsx
│   ├── context/                # Global state providers
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── customer/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SubmitTicket.jsx
│   │   │   ├── TicketDetail.jsx
│   │   │   ├── TicketHistory.jsx
│   │   │   └── Profile.jsx
│   │   ├── agent/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TicketQueue.jsx
│   │   │   ├── TicketDetail.jsx
│   │   │   ├── SLAMonitor.jsx
│   │   │   ├── Notifications.jsx
│   │   │   └── Profile.jsx
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── ManageTickets.jsx
│   │       ├── DomainConfig.jsx
│   │       ├── SLASettings.jsx
│   │       ├── UserManagement.jsx
│   │       ├── SLAReports.jsx
│   │       ├── Notifications.jsx
│   │       └── TenantSettings.jsx
│   ├── routes/                 # Protected route wrappers
│   │   ├── PrivateRoute.jsx
│   │   └── RoleRoute.jsx
│   ├── utils/                  # Helper functions
│   │   ├── priorityColors.js
│   │   └── slaHelpers.js
│   ├── App.jsx
│   └── main.jsx
```

### 4.2 Backend Structure (Node/Express)

```
server/
├── config/
│   └── db.js                   # MongoDB connection setup
├── controllers/
│   ├── authController.js
│   ├── ticketController.js
│   ├── domainController.js
│   ├── slaController.js
│   └── userController.js
├── middleware/
│   ├── authMiddleware.js        # JWT token verification
│   └── roleMiddleware.js        # Role-based access guard
├── models/
│   ├── User.js
│   ├── Ticket.js
│   ├── Domain.js
│   ├── SLAPolicy.js
│   └── Notification.js
├── routes/
│   ├── authRoutes.js
│   ├── ticketRoutes.js
│   ├── domainRoutes.js
│   ├── slaRoutes.js
│   └── userRoutes.js
├── services/
│   ├── priorityEngine.js        # Domain rules engine
│   └── slaMonitor.js            # Cron job SLA checker
├── utils/
│   └── apiResponse.js           # Standard API response format
├── .env
└── server.js                    # App entry point
```

---

## 5. Database Schema Design

### 5.1 User Schema

```js
User {
  _id        : ObjectId  (auto-generated)
  tenantId   : ObjectId  → ref: Domain
  name       : String    (required)
  email      : String    (unique, required)
  password   : String    (bcrypt hashed)
  role       : Enum      ['customer', 'agent', 'admin']
  domain     : Enum      ['banking', 'ecommerce', 'healthcare', 'edtech']
  isActive   : Boolean   (default: true)
  createdAt  : Date      (auto)
}
```

### 5.2 Ticket Schema

```js
Ticket {
  _id             : ObjectId  (auto-generated)
  tenantId        : ObjectId  → ref: Domain
  ticketNumber    : String    (auto-generated, unique e.g. TKT-00042)
  title           : String    (required)
  description     : String    (required)
  category        : String
  domain          : Enum      ['banking', 'ecommerce', 'healthcare', 'edtech']
  userPriority    : Enum      ['critical', 'high', 'medium', 'low']
  systemPriority  : Enum      ['critical', 'high', 'medium', 'low']
  finalPriority   : Enum      (systemPriority overrides userPriority if higher)
  status          : Enum      ['open', 'in_progress', 'resolved', 'closed']
  slaDeadline     : Date      (calculated at ticket creation)
  slaBreached     : Boolean   (default: false)
  createdBy       : ObjectId  → ref: User (customer)
  assignedTo      : ObjectId  → ref: User (agent)
  comments        : [{ author: ObjectId, message: String, createdAt: Date }]
  internalNotes   : [{ author: ObjectId, note: String, createdAt: Date }]
  createdAt       : Date      (auto)
  updatedAt       : Date      (auto)
}
```

### 5.3 Domain Schema

```js
Domain {
  _id       : ObjectId  (auto-generated)
  name      : Enum      ['banking', 'ecommerce', 'healthcare', 'edtech']
  tenantId  : ObjectId
  rules     : [
    {
      keyword  : String   (e.g. 'payment failed')
      priority : Enum     ['critical', 'high', 'medium', 'low']
    }
  ]
  createdAt : Date
}
```

### 5.4 SLA Policy Schema

```js
SLAPolicy {
  _id               : ObjectId
  tenantId          : ObjectId
  domain            : String
  priority          : Enum    ['critical', 'high', 'medium', 'low']
  responseTimeMin   : Number  (minutes before first response)
  resolutionTimeMin : Number  (minutes to full resolution)
  escalateAfterMin  : Number  (minutes before escalation alert)
}
```

### 5.5 Notification Schema

```js
Notification {
  _id       : ObjectId
  tenantId  : ObjectId
  userId    : ObjectId  → ref: User (recipient)
  type      : Enum      ['sla_breach', 'sla_warning', 'ticket_assigned', 'status_update']
  ticketId  : ObjectId  → ref: Ticket
  message   : String
  isRead    : Boolean   (default: false)
  createdAt : Date
}
```

---

## 6. REST API Endpoints

### 6.1 Auth Routes — `/api/auth`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login, returns JWT | Public |
| POST | `/api/auth/forgot-password` | Send reset email | Public |
| POST | `/api/auth/reset-password` | Reset with token | Public |
| GET | `/api/auth/me` | Get current user profile | Private |

### 6.2 Ticket Routes — `/api/tickets`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/tickets` | Create new ticket | Customer |
| GET | `/api/tickets` | Get all tickets (role-filtered) | All |
| GET | `/api/tickets/:id` | Get single ticket detail | All |
| PATCH | `/api/tickets/:id/status` | Update ticket status | Agent, Admin |
| PATCH | `/api/tickets/:id/priority` | Override ticket priority | Admin |
| POST | `/api/tickets/:id/comment` | Add comment | All |
| POST | `/api/tickets/:id/note` | Add internal note | Agent, Admin |
| GET | `/api/tickets/sla/breached` | Get SLA-breached tickets | Agent, Admin |
| GET | `/api/tickets/sla/atrisk` | Get tickets near SLA breach | Agent, Admin |

### 6.3 Domain Routes — `/api/domains`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/domains` | Get domain config for tenant | Admin |
| POST | `/api/domains/rules` | Add a new domain rule | Admin |
| PUT | `/api/domains/rules/:id` | Update a domain rule | Admin |
| DELETE | `/api/domains/rules/:id` | Delete a domain rule | Admin |

### 6.4 SLA Routes — `/api/sla`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/sla/policies` | Get all SLA policies for tenant | Admin |
| POST | `/api/sla/policies` | Create SLA policy | Admin |
| PUT | `/api/sla/policies/:id` | Update SLA policy | Admin |
| GET | `/api/sla/reports` | Get SLA analytics data | Admin |

### 6.5 User Routes — `/api/users`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get single user | Admin |
| PATCH | `/api/users/:id` | Update user info / role | Admin |
| PATCH | `/api/users/:id/toggle` | Activate / deactivate user | Admin |
| DELETE | `/api/users/:id` | Remove user | Admin |

---

## 7. Domain-Adaptive Rules Engine

The Domain Rules Engine is the core intelligence of TicketIQ. When a ticket is submitted, the engine scans the title and description for keywords defined in the domain's rule configuration and assigns a system priority automatically.

### 7.1 How Priority Is Determined

| Step | Action |
|---|---|
| 1. Ticket submitted | Customer fills title, description, selects userPriority |
| 2. Engine triggered | `priorityEngine.js` runs on ticket creation |
| 3. Keyword scan | Title + description lowercased, matched against domain rules |
| 4. Priority assigned | Highest matching rule priority becomes systemPriority |
| 5. Validation | If systemPriority > userPriority, systemPriority overrides |
| 6. SLA calculated | `slaDeadline = createdAt + resolutionTime for finalPriority` |

### 7.2 Priority Engine — Core Logic

```js
// services/priorityEngine.js
const assignPriority = (ticket, domainRules) => {
  const text = `${ticket.title} ${ticket.description}`.toLowerCase();
  
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  let highestPriority = 'low';

  for (const rule of domainRules) {
    if (text.includes(rule.keyword.toLowerCase())) {
      if (priorityOrder[rule.priority] > priorityOrder[highestPriority]) {
        highestPriority = rule.priority;
      }
    }
  }

  // systemPriority overrides userPriority if higher
  const systemPriority = highestPriority;
  const finalPriority =
    priorityOrder[systemPriority] > priorityOrder[ticket.userPriority]
      ? systemPriority
      : ticket.userPriority;

  return { systemPriority, finalPriority };
};
```

### 7.3 Example Domain Rules

| Domain | Keyword | Auto Priority |
|---|---|---|
| Banking | payment failed, transaction declined | CRITICAL |
| Banking | account locked, unauthorized access | CRITICAL |
| Banking | wrong balance, missing funds | HIGH |
| E-Commerce | order not delivered, missing package | HIGH |
| E-Commerce | refund not received, payment stuck | HIGH |
| E-Commerce | wrong item received | MEDIUM |
| Healthcare | system down, portal not loading | CRITICAL |
| Healthcare | appointment not confirmed | HIGH |
| EdTech | exam portal down, cannot submit | CRITICAL |
| EdTech | video not loading, quiz not saving | MEDIUM |

---

## 8. SLA Monitoring System

SLA monitoring ensures that tickets are resolved within the agreed timeframe. TicketIQ runs a background cron job every minute to check all open tickets against their SLA deadlines.

### 8.1 SLA Policy Defaults

| Priority | Response Time | Resolution Time | Escalation After |
|---|---|---|---|
| CRITICAL | 15 minutes | 1 hour | 45 minutes |
| HIGH | 30 minutes | 4 hours | 3 hours |
| MEDIUM | 2 hours | 24 hours | 20 hours |
| LOW | 8 hours | 72 hours | 60 hours |

### 8.2 SLA Deadline Calculation

```js
// Called at ticket creation in ticketController.js
const getSLADeadline = async (tenantId, domain, priority) => {
  const policy = await SLAPolicy.findOne({ tenantId, domain, priority });
  const deadline = new Date();
  deadline.setMinutes(deadline.getMinutes() + policy.resolutionTimeMin);
  return deadline;
};
```

### 8.3 SLA Cron Job

```js
// services/slaMonitor.js — runs every minute
const cron = require('node-cron');

cron.schedule('* * * * *', async () => {
  const now = new Date();

  // Find all open tickets past their SLA deadline
  const breached = await Ticket.find({
    status: { $in: ['open', 'in_progress'] },
    slaDeadline: { $lt: now },
    slaBreached: false
  });

  for (const ticket of breached) {
    // Mark ticket as breached
    ticket.slaBreached = true;
    await ticket.save();

    // Notify assigned agent and admin
    await Notification.create({
      tenantId: ticket.tenantId,
      userId: ticket.assignedTo,
      type: 'sla_breach',
      ticketId: ticket._id,
      message: `SLA breached for ticket ${ticket.ticketNumber}`,
    });
  }
});
```

---

## 9. Security Architecture

| Security Layer | Implementation |
|---|---|
| Authentication | JWT tokens, 7-day expiry, stored in httpOnly cookie |
| Authorization | Role middleware on every protected route |
| Multi-Tenant Isolation | `tenantId` filter on ALL database queries |
| Password Security | bcryptjs with salt rounds = 12 |
| Input Validation | express-validator on all POST/PATCH routes |
| CORS | Whitelist frontend origin only |
| Rate Limiting | express-rate-limit on auth routes (max 10 req/15min) |
| Environment Secrets | .env for DB URI, JWT secret (never committed to Git) |

### 9.1 Auth Middleware

```js
// middleware/authMiddleware.js
const protect = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select('-password');
  next();
};
```

### 9.2 Role Middleware

```js
// middleware/roleMiddleware.js
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

// Usage on routes:
// router.patch('/:id/priority', protect, authorize('admin'), overridePriority);
```

---

## 10. Role-Based Access Control

| Permission | Customer | Agent | Admin |
|---|---|---|---|
| Submit ticket | ✅ | ❌ | ✅ |
| View own tickets | ✅ | ✅ (assigned) | ✅ (all) |
| Update ticket status | ❌ | ✅ | ✅ |
| Override priority | ❌ | ❌ | ✅ |
| Add internal notes | ❌ | ✅ | ✅ |
| Configure domain rules | ❌ | ❌ | ✅ |
| Set SLA policies | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View SLA reports | ❌ | ❌ | ✅ |
| View SLA monitor | ❌ | ✅ | ✅ |

---

## 11. Application Pages Summary

### 11.1 Auth Pages (3)

| Page | Route |
|---|---|
| Login | `/login` |
| Register | `/register` |
| Forgot Password | `/forgot-password` |

### 11.2 Customer Pages (5)

| Page | Route |
|---|---|
| Customer Dashboard | `/customer/dashboard` |
| Submit Ticket | `/customer/submit` |
| Ticket Detail | `/customer/tickets/:id` |
| Ticket History | `/customer/tickets` |
| Profile | `/customer/profile` |

### 11.3 Agent Pages (6)

| Page | Route |
|---|---|
| Agent Dashboard | `/agent/dashboard` |
| Ticket Queue | `/agent/queue` |
| Ticket Detail | `/agent/tickets/:id` |
| SLA Monitor | `/agent/sla-monitor` |
| Notifications | `/agent/notifications` |
| Profile | `/agent/profile` |

### 11.4 Admin Pages (8)

| Page | Route |
|---|---|
| Admin Dashboard | `/admin/dashboard` |
| Manage Tickets | `/admin/tickets` |
| Domain Configuration | `/admin/domain-config` |
| SLA Settings | `/admin/sla-settings` |
| User Management | `/admin/users` |
| SLA Reports | `/admin/reports` |
| Notifications | `/admin/notifications` |
| Tenant Settings | `/admin/settings` |

---

## 12. Deployment Architecture

| Component | Platform / Tool |
|---|---|
| Frontend (React) | Vercel or Netlify |
| Backend (Node/Express) | Render or Railway |
| Database (MongoDB) | MongoDB Atlas |
| Environment Variables | .env on server, Vercel env settings |
| Domain / SSL | Custom domain + HTTPS (auto via host) |
| Version Control | GitHub repository |

### 12.1 Environment Variables

```bash
# server/.env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ticketiq
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
PORT=5000
CLIENT_URL=https://your-frontend.vercel.app

# client/.env
VITE_API_URL=https://your-backend.render.com
```

### 12.2 Run Locally

```bash
# Clone the repo
git clone https://github.com/yourname/ticketiq.git

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install

# Run backend (port 5000)
cd ../server && npm run dev

# Run frontend (port 5173)
cd ../client && npm run dev
```

---

## 13. Glossary

| Term | Definition |
|---|---|
| SLA | Service Level Agreement — the maximum time allowed to resolve a ticket |
| Tenant | A company/client using TicketIQ with their own isolated data |
| Domain | The industry/business type: Banking, E-Commerce, Healthcare, EdTech |
| Priority | Urgency level of a ticket: CRITICAL, HIGH, MEDIUM, LOW |
| Rules Engine | Service that auto-assigns priority based on keyword matching |
| SLA Breach | When a ticket is not resolved before its SLA deadline |
| JWT | JSON Web Token — used for stateless user authentication |
| RBAC | Role-Based Access Control — permissions based on user role |
| Cron Job | Scheduled background task running at regular time intervals |
| Multi-Tenant | Single platform serving multiple isolated client organizations |
| finalPriority | The effective priority after system validation overrides user input |
| tenantId | Unique identifier attached to every DB document for data isolation |

---

*TicketIQ © 2026 — Software Engineering Subject Project*
