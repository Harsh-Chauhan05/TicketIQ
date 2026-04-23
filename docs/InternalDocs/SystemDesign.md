# TicketIQ — System Design Document

> **Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document Type | System Design Document |
| Version | 1.0.0 |
| Product Name | TicketIQ |
| Tech Stack | MERN (MongoDB, Express, React, Node.js) |
| Design Style | Monolithic MERN — Service-Separated |
| Date | March 2026 |

---

## Table of Contents

1. [System Design Overview](#1-system-design-overview)
2. [High-Level Design](#2-high-level-design)
3. [Low-Level Design](#3-low-level-design)
4. [Database Design](#4-database-design)
5. [API Design](#5-api-design)
6. [Domain Rules Engine Design](#6-domain-rules-engine-design)
7. [SLA Monitoring Service Design](#7-sla-monitoring-service-design)
8. [Authentication & Authorization Design](#8-authentication--authorization-design)
9. [Frontend Architecture Design](#9-frontend-architecture-design)
10. [Multi-Tenant Design](#10-multi-tenant-design)
11. [Notification System Design](#11-notification-system-design)
12. [Data Flow Diagrams](#12-data-flow-diagrams)
13. [Component Interaction Design](#13-component-interaction-design)
14. [Error Handling Design](#14-error-handling-design)
15. [Deployment Design](#15-deployment-design)

---

## 1. System Design Overview

### 1.1 What is System Design

System design is the process of defining the architecture, components, modules, interfaces, and data flow of a system to satisfy specified requirements. For TicketIQ, this document defines **how** every part of the system is built internally — from the database schemas to API contracts to frontend component hierarchy.

### 1.2 Design Goals

| Goal | Description |
|---|---|
| Correctness | System must prioritize tickets accurately using domain rules |
| Isolation | Each tenant's data must never be accessible by another tenant |
| Reliability | SLA cron job must never miss a breach detection cycle |
| Simplicity | MERN stack only — no unnecessary complexity for an MVP |
| Scalability | Data-driven rules (DB, not hardcoded) so new domains require no code changes |
| Security | Every route protected — no unauthorized data access |

### 1.3 Design Constraints

- Must use MERN stack only (MongoDB, Express, React, Node.js)
- Must be deployable on free-tier cloud services
- Single developer — design must be simple enough to build in 6 weeks
- No microservices — monolithic backend with service separation

---

## 2. High-Level Design

### 2.1 System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │              React SPA (Vite + Tailwind)                 │  │
│   │                                                          │  │
│   │   Auth Pages │ Customer Pages │ Agent Pages │ Admin Pages│  │
│   │                                                          │  │
│   │   Context: AuthContext │ NotificationContext             │  │
│   │   API Layer: axios calls to /api/*                       │  │
│   └──────────────────────────────────────────────────────────┘  │
│                           │ HTTP REST (JSON)                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                    SERVER LAYER                                  │
│                           ▼                                      │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │              Express.js Application                      │  │
│   │                                                          │  │
│   │   ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│   │   │  Routes  │  │  Middle  │  │ Controllers│             │  │
│   │   │          │→ │  -ware   │→ │           │             │  │
│   │   │ /auth    │  │ JWT Auth │  │  Auth     │             │  │
│   │   │ /tickets │  │ Role Check│  │  Ticket   │             │  │
│   │   │ /domains │  │ Validate │  │  Domain   │             │  │
│   │   │ /sla     │  │ TenantId │  │  SLA      │             │  │
│   │   │ /users   │  └──────────┘  │  User     │             │  │
│   │   └──────────┘                └──────────┘              │  │
│   │                                    │                     │  │
│   │   ┌─────────────────────────────────────────────────┐   │  │
│   │   │              Services Layer                     │   │  │
│   │   │                                                 │   │  │
│   │   │  priorityEngine.js    │  slaMonitor.js (cron)  │   │  │
│   │   └─────────────────────────────────────────────────┘   │  │
│   └──────────────────────────────────────────────────────────┘  │
│                           │ Mongoose ODM                         │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                    DATA LAYER                                    │
│                           ▼                                      │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                  MongoDB Atlas                           │  │
│   │                                                          │  │
│   │  users │ tickets │ domains │ slapolicies │ notifications │  │
│   └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Request Lifecycle (High Level)

```
Browser → React App → axios → Express Route
       → authMiddleware (verify JWT)
       → roleMiddleware (check role)
       → Controller (business logic)
       → Service (priority engine / SLA calc)
       → Mongoose Model (DB operation)
       → MongoDB Atlas
       → Response JSON
       → React updates UI state
```

### 2.3 Technology Mapping

| Layer | Technology | Responsibility |
|---|---|---|
| Presentation | React 18 + Tailwind CSS | UI rendering, user interactions |
| Routing (client) | React Router v6 | SPA navigation, protected routes |
| State | React Context API | Auth state, notification state |
| HTTP Client | Axios | API calls with interceptors |
| API Server | Express.js | Route handling, middleware pipeline |
| Business Logic | Node.js Services | Priority engine, SLA monitor |
| Data Access | Mongoose ODM | Schema validation, DB queries |
| Database | MongoDB Atlas | Document storage |
| Auth Tokens | JWT (jsonwebtoken) | Stateless authentication |
| Scheduling | node-cron | SLA breach detection every minute |
| Password Hash | bcryptjs | Secure password storage |

---

## 3. Low-Level Design

### 3.1 Backend Module Design

#### server.js — Entry Point

```js
// Responsibilities:
// 1. Initialize Express app
// 2. Connect to MongoDB
// 3. Register global middleware (cors, json parser, cookie-parser)
// 4. Register all route modules
// 5. Start SLA monitor cron job
// 6. Start HTTP server on PORT

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth',    authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/sla',     slaRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/notifications', notificationRoutes);

// Start SLA monitor
require('./services/slaMonitor');

app.listen(PORT);
```

#### Controller Design Pattern

All controllers follow this response pattern:

```js
// utils/apiResponse.js
const success = (res, data, message = 'Success', status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

const error = (res, message = 'Server Error', status = 500) => {
  return res.status(status).json({ success: false, message });
};

module.exports = { success, error };
```

#### Middleware Pipeline Design

```
Incoming Request
      │
      ▼
  cors()              → Allow requests from frontend origin only
      │
      ▼
  express.json()      → Parse JSON request body
      │
      ▼
  cookieParser()      → Parse cookies (for JWT)
      │
      ▼
  authMiddleware      → Verify JWT token, attach req.user
      │
      ▼
  roleMiddleware      → Check req.user.role against allowed roles
      │
      ▼
  express-validator   → Validate and sanitize inputs
      │
      ▼
  Controller          → Execute business logic
      │
      ▼
  Response JSON       → Return structured response
```

### 3.2 Service Layer Design

The service layer separates business logic from controllers. Two core services:

| Service | File | Trigger | Responsibility |
|---|---|---|---|
| Priority Engine | `priorityEngine.js` | Called by ticketController on POST /tickets | Scan text, match rules, return systemPriority + finalPriority |
| SLA Monitor | `slaMonitor.js` | node-cron, every 60 seconds | Query breached tickets, update DB, create notifications |

---

## 4. Database Design

### 4.1 Collections Overview

```
MongoDB Database: ticketiq
│
├── users
├── tickets
├── domains
├── slapolicies
└── notifications
```

### 4.2 Detailed Schema Design

#### Collection: users

```js
{
  _id        : ObjectId,          // Primary key (auto)
  tenantId   : ObjectId,          // FK → domains._id
  name       : String,            // required, trim
  email      : String,            // required, unique, lowercase
  password   : String,            // bcrypt hash, select: false
  role       : String,            // enum: ['customer','agent','admin']
  domain     : String,            // enum: ['banking','ecommerce','healthcare','edtech']
  isActive   : Boolean,           // default: true
  createdAt  : Date,              // auto (timestamps: true)
  updatedAt  : Date               // auto (timestamps: true)
}

Indexes:
  { email: 1 }              → unique index
  { tenantId: 1, role: 1 }  → compound index for role queries
```

#### Collection: tickets

```js
{
  _id             : ObjectId,
  tenantId        : ObjectId,     // FK → domains._id
  ticketNumber    : String,       // unique e.g. TKT-00042
  title           : String,       // required, maxLength: 200
  description     : String,       // required, maxLength: 2000
  category        : String,       // e.g. 'Payment', 'Delivery'
  domain          : String,       // enum: 4 domains
  userPriority    : String,       // enum: ['critical','high','medium','low']
  systemPriority  : String,       // set by priority engine
  finalPriority   : String,       // max(userPriority, systemPriority)
  status          : String,       // enum: ['open','in_progress','resolved','closed']
  slaDeadline     : Date,         // calculated at creation
  slaBreached     : Boolean,      // default: false
  createdBy       : ObjectId,     // FK → users._id
  assignedTo      : ObjectId,     // FK → users._id (agent), nullable
  comments        : [
    {
      author    : ObjectId,       // FK → users._id
      message   : String,
      createdAt : Date
    }
  ],
  internalNotes   : [
    {
      author    : ObjectId,       // FK → users._id
      note      : String,
      createdAt : Date
    }
  ],
  createdAt       : Date,
  updatedAt       : Date
}

Indexes:
  { tenantId: 1, status: 1 }              → filter by tenant + status
  { tenantId: 1, finalPriority: 1 }       → priority sorted queue
  { tenantId: 1, slaBreached: 1 }         → SLA breach queries
  { tenantId: 1, slaDeadline: 1 }         → cron job breach scan
  { createdBy: 1 }                        → customer ticket history
  { assignedTo: 1 }                       → agent queue
  { ticketNumber: 1 }                     → unique lookup
```

#### Collection: domains

```js
{
  _id       : ObjectId,
  tenantId  : ObjectId,
  name      : String,            // enum: 4 domain types
  rules     : [
    {
      _id      : ObjectId,       // auto for each rule
      keyword  : String,         // comma-separated keywords
      priority : String          // enum: priority levels
    }
  ],
  createdAt : Date,
  updatedAt : Date
}

Indexes:
  { tenantId: 1, name: 1 }  → unique per tenant
```

#### Collection: slapolicies

```js
{
  _id               : ObjectId,
  tenantId          : ObjectId,
  domain            : String,
  priority          : String,    // enum: priority levels
  resolutionTimeMin : Number,    // minutes to resolve
  escalateAfterMin  : Number,    // minutes before escalation
  createdAt         : Date,
  updatedAt         : Date
}

Indexes:
  { tenantId: 1, domain: 1, priority: 1 }  → unique policy lookup
```

#### Collection: notifications

```js
{
  _id       : ObjectId,
  tenantId  : ObjectId,
  userId    : ObjectId,          // recipient FK → users._id
  type      : String,            // enum: ['sla_breach','ticket_assigned',
                                 //        'status_update','sla_warning']
  ticketId  : ObjectId,          // FK → tickets._id
  message   : String,
  isRead    : Boolean,           // default: false
  createdAt : Date
}

Indexes:
  { userId: 1, isRead: 1 }    → unread notification fetch
  { tenantId: 1 }             → tenant-scoped queries
```

### 4.3 Entity Relationship Diagram

```
users ──────────────────── tickets
  │  (1 customer : many tickets)  │
  │                               │
  │  (1 agent : many assigned)    │
  │                               │
  └───────────────────────────────┘
         │                  │
         │                  │
       domains          slapolicies
    (rules array)    (per priority)
         │
         │
   notifications
  (per user, per ticket)
```

### 4.4 Ticket Number Auto-Generation

```js
// In ticketController.js before saving
const generateTicketNumber = async (tenantId) => {
  const count = await Ticket.countDocuments({ tenantId });
  const padded = String(count + 1).padStart(5, '0');
  return `TKT-${padded}`;
  // Result: TKT-00001, TKT-00002, ... TKT-00042
};
```

---

## 5. API Design

### 5.1 API Design Principles

- All routes prefixed with `/api/`
- All responses in JSON with consistent structure
- All protected routes require `Authorization: Bearer <token>` header
- All tenant-scoped queries include `tenantId` filter automatically
- HTTP status codes used correctly (200, 201, 400, 401, 403, 404, 500)

### 5.2 Standard Response Format

```js
// Success Response
{
  "success": true,
  "message": "Ticket created successfully",
  "data": { ...ticketObject }
}

// Error Response
{
  "success": false,
  "message": "Unauthorized — token missing or invalid"
}

// Validation Error Response
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "title", "message": "Title is required" },
    { "field": "priority", "message": "Priority must be one of: critical, high, medium, low" }
  ]
}
```

### 5.3 Core API Contracts

#### POST /api/auth/register

```
Request Body:
{
  "name"     : "Rahul Mehta",
  "email"    : "rahul@example.com",
  "password" : "SecurePass123",
  "role"     : "customer",
  "domain"   : "banking"
}

Success Response (201):
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Rahul Mehta",
      "email": "rahul@example.com",
      "role": "customer",
      "domain": "banking"
    }
  }
}
```

#### POST /api/tickets (Create Ticket)

```
Request Body:
{
  "title"        : "My payment failed twice today",
  "description"  : "Transaction was declined. Money deducted but not transferred.",
  "category"     : "Payment",
  "userPriority" : "medium"
}

Success Response (201):
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "_id"            : "64f1a2b3c4d5e6f7a8b9c0d2",
    "ticketNumber"   : "TKT-00042",
    "title"          : "My payment failed twice today",
    "userPriority"   : "medium",
    "systemPriority" : "critical",
    "finalPriority"  : "critical",
    "status"         : "open",
    "slaDeadline"    : "2026-03-16T15:30:00.000Z",
    "slaBreached"    : false,
    "domain"         : "banking"
  }
}
```

#### GET /api/tickets (Get Ticket List)

```
Query Parameters (all optional):
  ?status=open
  ?priority=critical
  ?domain=banking
  ?page=1&limit=10

Success Response (200):
{
  "success": true,
  "data": {
    "tickets": [ ...ticketObjects ],
    "total": 48,
    "page": 1,
    "pages": 5
  }
}
```

#### PATCH /api/tickets/:id/status

```
Request Body:
{
  "status": "in_progress"
}

Success Response (200):
{
  "success": true,
  "message": "Ticket status updated to in_progress",
  "data": { ...updatedTicket }
}
```

---

## 6. Domain Rules Engine Design

### 6.1 Engine Architecture

```
Ticket Created (POST /api/tickets)
        │
        ▼
ticketController.createTicket()
        │
        ▼
priorityEngine.assignPriority(ticket, tenantId)
        │
        ├─── Step 1: Load domain rules from DB
        │    Domain.findOne({ tenantId, name: ticket.domain })
        │
        ├─── Step 2: Normalize ticket text
        │    text = (title + " " + description).toLowerCase()
        │
        ├─── Step 3: Match keywords
        │    for each rule in domain.rules:
        │      for each keyword in rule.keyword.split(','):
        │        if text.includes(keyword.trim()):
        │          candidate = rule.priority
        │
        ├─── Step 4: Select highest priority
        │    systemPriority = max(all candidate priorities)
        │
        ├─── Step 5: Validate against userPriority
        │    finalPriority = max(systemPriority, userPriority)
        │
        └─── Return { systemPriority, finalPriority }
```

### 6.2 Priority Ranking System

```js
// Priority has numeric rank for comparison
const PRIORITY_RANK = {
  critical : 4,   // highest
  high     : 3,
  medium   : 2,
  low      : 1    // lowest
};

// Compare two priorities, return the higher one
const higherPriority = (p1, p2) => {
  return PRIORITY_RANK[p1] >= PRIORITY_RANK[p2] ? p1 : p2;
};
```

### 6.3 Full Priority Engine Implementation

```js
// services/priorityEngine.js

const Domain = require('../models/Domain');

const PRIORITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 };

const assignPriority = async (ticketData, tenantId) => {
  try {
    // Load domain rules from database
    const domain = await Domain.findOne({
      tenantId,
      name: ticketData.domain
    });

    if (!domain || !domain.rules.length) {
      // No rules configured — use userPriority as finalPriority
      return {
        systemPriority : ticketData.userPriority,
        finalPriority  : ticketData.userPriority
      };
    }

    // Normalize text for matching
    const text = `${ticketData.title} ${ticketData.description}`.toLowerCase();

    let systemPriority = 'low';

    // Scan each rule
    for (const rule of domain.rules) {
      const keywords = rule.keyword
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);

      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          // Update systemPriority if this rule is higher
          if (PRIORITY_RANK[rule.priority] > PRIORITY_RANK[systemPriority]) {
            systemPriority = rule.priority;
          }
          break; // No need to check more keywords in this rule
        }
      }

      // Short-circuit: already at highest, no need to continue
      if (systemPriority === 'critical') break;
    }

    // finalPriority = whichever is higher: system or user
    const finalPriority =
      PRIORITY_RANK[systemPriority] >= PRIORITY_RANK[ticketData.userPriority]
        ? systemPriority
        : ticketData.userPriority;

    return { systemPriority, finalPriority };

  } catch (err) {
    console.error('Priority engine error:', err.message);
    // Fallback: use userPriority so ticket creation doesn't fail
    return {
      systemPriority : ticketData.userPriority,
      finalPriority  : ticketData.userPriority
    };
  }
};

module.exports = { assignPriority };
```

### 6.4 Engine Integration in Ticket Controller

```js
// controllers/ticketController.js — createTicket function

const createTicket = async (req, res) => {
  const { title, description, category, userPriority } = req.body;
  const { tenantId, domain, _id: createdBy } = req.user;

  // Step 1: Run priority engine
  const { systemPriority, finalPriority } = await assignPriority(
    { title, description, domain, userPriority },
    tenantId
  );

  // Step 2: Calculate SLA deadline
  const slaPolicy = await SLAPolicy.findOne({ tenantId, domain, priority: finalPriority });
  const slaDeadline = new Date(Date.now() + slaPolicy.resolutionTimeMin * 60 * 1000);

  // Step 3: Generate ticket number
  const ticketNumber = await generateTicketNumber(tenantId);

  // Step 4: Create and save ticket
  const ticket = await Ticket.create({
    tenantId, ticketNumber, title, description,
    category, domain, userPriority, systemPriority,
    finalPriority, slaDeadline, createdBy, status: 'open'
  });

  return success(res, ticket, 'Ticket created successfully', 201);
};
```

---

## 7. SLA Monitoring Service Design

### 7.1 SLA Monitor Architecture

```
Node.js Process Start
        │
        ▼
slaMonitor.js loaded by server.js
        │
        ▼
node-cron schedules job: '* * * * *'  (every 60 seconds)
        │
        ▼
        ┌──────────────────────────────────────┐
        │         Every 60 Seconds             │
        │                                      │
        │  1. Query breached tickets           │
        │     - status: open OR in_progress    │
        │     - slaDeadline < now              │
        │     - slaBreached: false             │
        │                                      │
        │  2. For each breached ticket:        │
        │     a. Set slaBreached = true        │
        │     b. Save ticket                   │
        │     c. Create notification for agent │
        │                                      │
        │  3. Log: "Checked N tickets,         │
        │           M breaches found"          │
        └──────────────────────────────────────┘
```

### 7.2 Full SLA Monitor Implementation

```js
// services/slaMonitor.js

const cron     = require('node-cron');
const Ticket   = require('../models/Ticket');
const Notification = require('../models/Notification');

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();

    // Find all unresolved tickets that have passed their SLA deadline
    const breachedTickets = await Ticket.find({
      status      : { $in: ['open', 'in_progress'] },
      slaDeadline : { $lt: now },
      slaBreached : false
    }).select('_id ticketNumber tenantId assignedTo finalPriority');

    if (breachedTickets.length === 0) return;

    // Process each breached ticket
    const updates = breachedTickets.map(async (ticket) => {
      // Mark as breached
      await Ticket.findByIdAndUpdate(ticket._id, { slaBreached: true });

      // Create notification if ticket is assigned to an agent
      if (ticket.assignedTo) {
        await Notification.create({
          tenantId  : ticket.tenantId,
          userId    : ticket.assignedTo,
          type      : 'sla_breach',
          ticketId  : ticket._id,
          message   : `⚠ SLA breached for ticket ${ticket.ticketNumber} [${ticket.finalPriority.toUpperCase()}]`,
          isRead    : false
        });
      }
    });

    await Promise.all(updates);

    console.log(`[SLA Monitor] ${breachedTickets.length} breach(es) detected at ${now.toISOString()}`);

  } catch (err) {
    console.error('[SLA Monitor] Error:', err.message);
    // Cron job continues even if this cycle fails
  }
});
```

### 7.3 SLA Deadline Calculation Design

```js
// Called in ticketController.createTicket()

const calculateSLADeadline = async (tenantId, domain, priority) => {
  const policy = await SLAPolicy.findOne({ tenantId, domain, priority });

  if (!policy) {
    // Fallback defaults if no policy configured
    const defaults = { critical: 60, high: 240, medium: 1440, low: 4320 };
    const minutes = defaults[priority] || 1440;
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  return new Date(Date.now() + policy.resolutionTimeMin * 60 * 1000);
};
```

### 7.4 SLA Status Logic (Frontend)

```js
// utils/slaHelpers.js

export const getSLAStatus = (slaDeadline, slaBreached, resolutionTimeMin) => {
  if (slaBreached) {
    return { label: 'BREACHED', color: '#EF4444', status: 'breached', progress: 0 };
  }

  const now        = new Date();
  const deadline   = new Date(slaDeadline);
  const remaining  = deadline - now;                  // milliseconds left
  const total      = resolutionTimeMin * 60 * 1000;   // total duration in ms
  const progress   = Math.max(0, Math.min(remaining / total, 1)); // 0 to 1
  const minsLeft   = Math.max(0, Math.floor(remaining / 60000));

  if (remaining <= 0) {
    return { label: 'BREACHED', color: '#EF4444', status: 'breached', progress: 0 };
  }
  if (minsLeft <= 30) {
    return { label: `${minsLeft}m`, color: '#EF4444', status: 'critical', progress };
  }
  if (minsLeft <= 120) {
    const h = Math.floor(minsLeft / 60), m = minsLeft % 60;
    return { label: `${h}h ${m}m`, color: '#F59E0B', status: 'warning', progress };
  }

  const hours = Math.floor(minsLeft / 60), mins = minsLeft % 60;
  return { label: `${hours}h ${mins}m`, color: '#22C55E', status: 'safe', progress };
};
```

---

## 8. Authentication & Authorization Design

### 8.1 Auth Flow Design

```
REGISTRATION FLOW:
  Client → POST /api/auth/register
         → Validate inputs
         → Check email uniqueness
         → Hash password (bcrypt, 12 rounds)
         → Create user in DB
         → Sign JWT (payload: { id, role, tenantId })
         → Set httpOnly cookie
         → Return user + token

LOGIN FLOW:
  Client → POST /api/auth/login
         → Find user by email
         → Compare password (bcrypt.compare)
         → Sign JWT
         → Set httpOnly cookie
         → Return user + token

PROTECTED REQUEST FLOW:
  Client → Any protected route
         → authMiddleware:
             Extract token from cookie / Authorization header
             jwt.verify(token, JWT_SECRET)
             Find user by decoded.id
             Check user.isActive === true
             Attach user to req.user
         → roleMiddleware:
             Check req.user.role in allowedRoles[]
             If not → 403 Forbidden
         → Controller runs
```

### 8.2 JWT Design

```js
// JWT Payload Structure
{
  id       : "64f1a2b3c4d5e6f7a8b9c0d1",  // user._id
  role     : "agent",                       // for role checks
  tenantId : "64f1a2b3c4d5e6f7a8b9c0d2",  // for data isolation
  iat      : 1710000000,                    // issued at
  exp      : 1710604800                     // expires in 7 days
}

// Signing
const token = jwt.sign(
  { id: user._id, role: user.role, tenantId: user.tenantId },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE }   // '7d'
);
```

### 8.3 Auth Middleware Implementation

```js
// middleware/authMiddleware.js

const protect = async (req, res, next) => {
  let token;

  // Check Authorization header first, then cookie
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized — no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');

    if (!user)           return res.status(401).json({ success: false, message: 'User not found' });
    if (!user.isActive)  return res.status(403).json({ success: false, message: 'Account deactivated' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};
```

### 8.4 Role Middleware Implementation

```js
// middleware/roleMiddleware.js

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success : false,
      message : `Access denied — requires role: ${allowedRoles.join(' or ')}`
    });
  }
  next();
};

// Usage examples:
// router.get('/admin/users',      protect, authorize('admin'),          getUsers);
// router.patch('/:id/status',     protect, authorize('agent', 'admin'), updateStatus);
// router.post('/tickets',         protect, authorize('customer'),       createTicket);
```

---

## 9. Frontend Architecture Design

### 9.1 React App Structure

```
App.jsx
  │
  ├── AuthContext.Provider
  │     └── NotificationContext.Provider
  │           │
  │           ├── Public Routes (no auth needed)
  │           │     ├── /login           → Login.jsx
  │           │     ├── /register        → Register.jsx
  │           │     └── /forgot-password → ForgotPassword.jsx
  │           │
  │           └── PrivateRoute (requires login)
  │                 │
  │                 ├── RoleRoute role="customer"
  │                 │     └── /customer/*  → Customer pages
  │                 │
  │                 ├── RoleRoute role="agent"
  │                 │     └── /agent/*     → Agent pages
  │                 │
  │                 └── RoleRoute role="admin"
  │                       └── /admin/*     → Admin pages
```

### 9.2 Auth Context Design

```jsx
// context/AuthContext.jsx

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token and load user on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await axios.get('/api/auth/me');
        setUser(data.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    setUser(data.data.user);
    return data.data.user; // return for redirect logic
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 9.3 Protected Route Design

```jsx
// routes/PrivateRoute.jsx
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/login" />;
};

// routes/RoleRoute.jsx
const RoleRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (user?.role !== role) return <Navigate to={`/${user?.role}/dashboard`} />;
  return children;
};
```

### 9.4 Axios Instance Design

```js
// api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL         : import.meta.env.VITE_API_URL,
  withCredentials : true,            // send cookies with every request
  headers         : { 'Content-Type': 'application/json' }
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/login'; // force re-login
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 9.5 Core Reusable Components

| Component | Props | Responsibility |
|---|---|---|
| `PriorityBadge` | `priority: string` | Renders colored pill badge |
| `StatusBadge` | `status: string` | Renders status with color |
| `SLARingTimer` | `slaDeadline, slaBreached, totalMin` | Circular SVG countdown ring |
| `StatsCard` | `title, value, icon, trend` | Dashboard metric card |
| `TicketRow` | `ticket` | Single row in ticket tables |
| `Sidebar` | `role` | Role-aware navigation sidebar |
| `Navbar` | — | Top bar with notifications bell |
| `ConfirmDialog` | `message, onConfirm` | Reusable confirmation modal |
| `LoadingSpinner` | — | Full-page or inline loader |

---

## 10. Multi-Tenant Design

### 10.1 Tenant Isolation Strategy

TicketIQ uses **logical multi-tenancy** — all tenants share the same database and collections, but every document is tagged with a `tenantId`. Every query filters by `tenantId` automatically.

```
Single MongoDB Database
        │
        ├── Tenant A (Google Pay) ← tenantId: "abc123"
        │     Users, Tickets, Domain Rules, SLA Policies
        │
        ├── Tenant B (Amazon) ← tenantId: "def456"
        │     Users, Tickets, Domain Rules, SLA Policies
        │
        └── Tenant C (Apollo Hospital) ← tenantId: "ghi789"
              Users, Tickets, Domain Rules, SLA Policies
```

### 10.2 tenantId Enforcement Pattern

```js
// Every controller MUST follow this pattern:

// ✅ CORRECT — always filter by tenantId
const tickets = await Ticket.find({
  tenantId : req.user.tenantId,   // from JWT
  status   : 'open'
});

// ❌ WRONG — missing tenantId allows cross-tenant access
const tickets = await Ticket.find({ status: 'open' });
```

### 10.3 Tenant Onboarding Flow

```
Admin registers with domain selection (e.g. "banking")
          │
          ▼
System creates User record with role: admin
          │
          ▼
System seeds Domain record with default banking rules
          │
          ▼
System seeds SLAPolicy records (4 priorities × banking)
          │
          ▼
Admin logs in → configures rules → invites agents
          │
          ▼
Agents register with same tenantId
          │
          ▼
Customers register → start submitting tickets
```

---

## 11. Notification System Design

### 11.1 Notification Types

| Type | Trigger | Recipient |
|---|---|---|
| `sla_breach` | Cron job detects breach | Assigned agent |
| `ticket_assigned` | Admin assigns ticket to agent | Agent |
| `status_update` | Agent updates ticket status | Customer |
| `sla_warning` | Ticket reaches 80% of SLA time | Assigned agent |

### 11.2 Notification Flow

```
SLA Breach Detected (cron job)
        │
        ▼
Notification.create({
  tenantId, userId: ticket.assignedTo,
  type: 'sla_breach', ticketId, message
})
        │
        ▼
Agent's frontend polls GET /api/notifications
every 30 seconds (or on page focus)
        │
        ▼
Unread count shown in Navbar bell icon
        │
        ▼
Agent opens Notifications page → sees breach alert
        │
        ▼
Agent clicks notification → navigates to ticket
        │
        ▼
PATCH /api/notifications/read-all
→ All notifications marked isRead: true
```

### 11.3 Notification API Design

```js
// GET /api/notifications
// Returns unread notifications for req.user

const getNotifications = async (req, res) => {
  const notifications = await Notification.find({
    userId   : req.user._id,
    tenantId : req.user.tenantId
  })
  .sort({ createdAt: -1 })
  .limit(50)
  .populate('ticketId', 'ticketNumber title finalPriority');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return success(res, { notifications, unreadCount });
};
```

---

## 12. Data Flow Diagrams

### 12.1 Ticket Creation Data Flow

```
[Customer] fills Submit Ticket form
      │
      │  POST /api/tickets
      │  { title, description, category, userPriority }
      ▼
[Express] authMiddleware verifies JWT
      │
      ▼
[ticketController.createTicket()]
      │
      ├──▶ [priorityEngine.assignPriority()]
      │         │
      │         ├── Query: Domain.findOne({ tenantId, name: domain })
      │         ├── Scan title+description for keywords
      │         ├── Return: { systemPriority, finalPriority }
      │         └──▶ Back to controller
      │
      ├──▶ [calculateSLADeadline()]
      │         │
      │         ├── Query: SLAPolicy.findOne({ tenantId, domain, priority: finalPriority })
      │         ├── Compute: now + resolutionTimeMin
      │         └──▶ Back to controller
      │
      ├──▶ generateTicketNumber(tenantId)
      │
      ▼
[Ticket.create()] → MongoDB Atlas saves document
      │
      ▼
[Response 201] → { ticket with finalPriority + slaDeadline }
      │
      ▼
[React] updates Customer Dashboard state → ticket appears in list
```

### 12.2 SLA Breach Detection Data Flow

```
[node-cron] fires every 60 seconds
      │
      ▼
[slaMonitor.js]
      │
      ├── Query MongoDB:
      │   Ticket.find({
      │     status: { $in: ['open','in_progress'] },
      │     slaDeadline: { $lt: new Date() },
      │     slaBreached: false
      │   })
      │
      ├── For each breached ticket:
      │     ├── Ticket.findByIdAndUpdate → slaBreached: true
      │     └── Notification.create → type: 'sla_breach', userId: assignedTo
      │
      ▼
[Agent frontend] polls GET /api/notifications every 30s
      │
      ▼
[Navbar] shows red badge with unread count
      │
      ▼
[Agent] sees breach alert → opens SLA Monitor page
      │
      ▼
[SLA Monitor] shows ticket in BREACHED lane (red)
```

### 12.3 Admin Rule Configuration Data Flow

```
[Admin] opens Domain Configuration page
      │
      ▼
GET /api/domains → load current rules → display in table
      │
[Admin] clicks "+ Add Rule"
      │
      ▼
[Form] keyword: "fraud alert", priority: "critical"
      │
      │  POST /api/domains/rules
      │  { keyword: "fraud alert", priority: "critical" }
      ▼
[domainController.addRule()]
      │
      ├── authMiddleware (verify JWT)
      ├── roleMiddleware (admin only)
      │
      ▼
Domain.findOneAndUpdate(
  { tenantId, name: domain },
  { $push: { rules: { keyword, priority } } }
)
      │
      ▼
[Response 201] → updated domain rules
      │
      ▼
[React] refreshes rules table → new rule visible
      │
[Next ticket] with "fraud alert" → engine matches → CRITICAL
```

---

## 13. Component Interaction Design

### 13.1 Backend Component Dependencies

```
server.js
  ├── config/db.js               (MongoDB connection)
  ├── routes/authRoutes.js
  │     └── controllers/authController.js
  │           └── models/User.js
  ├── routes/ticketRoutes.js
  │     └── controllers/ticketController.js
  │           ├── models/Ticket.js
  │           ├── models/SLAPolicy.js
  │           ├── services/priorityEngine.js
  │           │     └── models/Domain.js
  │           └── models/Notification.js
  ├── routes/domainRoutes.js
  │     └── controllers/domainController.js
  │           └── models/Domain.js
  ├── routes/slaRoutes.js
  │     └── controllers/slaController.js
  │           └── models/SLAPolicy.js
  ├── routes/userRoutes.js
  │     └── controllers/userController.js
  │           └── models/User.js
  ├── middleware/authMiddleware.js
  ├── middleware/roleMiddleware.js
  └── services/slaMonitor.js
        ├── models/Ticket.js
        └── models/Notification.js
```

### 13.2 Frontend Component Dependencies

```
App.jsx
  ├── AuthContext (provides: user, login, logout)
  ├── NotificationContext (provides: notifications, unreadCount)
  │
  ├── pages/auth/Login.jsx
  │     └── api/auth.js → POST /api/auth/login
  │
  ├── pages/customer/Dashboard.jsx
  │     ├── components/StatsCard.jsx
  │     ├── components/TicketRow.jsx
  │     │     ├── components/PriorityBadge.jsx
  │     │     ├── components/StatusBadge.jsx
  │     │     └── components/SLARingTimer.jsx
  │     └── api/tickets.js → GET /api/tickets
  │
  ├── pages/agent/TicketQueue.jsx
  │     ├── components/TicketRow.jsx (with SLA ring)
  │     └── api/tickets.js → GET /api/tickets?assignedTo=me
  │
  └── pages/admin/DomainConfig.jsx
        └── api/domains.js → GET/POST/PUT/DELETE /api/domains/rules
```

---

## 14. Error Handling Design

### 14.1 Backend Error Handling

```js
// Centralized error handler in server.js
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field   : e.path,
      message : e.message
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success : false,
      message : `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  // Default server error
  return res.status(500).json({ success: false, message: 'Internal server error' });
});
```

### 14.2 Frontend Error Handling

```js
// Pattern used in all API calls
const fetchTickets = async () => {
  setLoading(true);
  setError(null);
  try {
    const { data } = await api.get('/tickets');
    setTickets(data.data.tickets);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to load tickets');
  } finally {
    setLoading(false);
  }
};
```

### 14.3 Error States in UI

| Scenario | UI Behavior |
|---|---|
| API call fails | Show inline error message in red below the component |
| Form validation fails | Show field-level errors below each input |
| 401 Unauthorized | Redirect to /login automatically (axios interceptor) |
| 403 Forbidden | Show "Access Denied" page |
| 404 Not Found | Show "Ticket not found" message |
| Network offline | Show "Connection lost — retrying..." banner |
| Empty state (no tickets) | Show illustrated empty state with CTA button |

---

## 15. Deployment Design

### 15.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                     │
│                                                         │
│  ┌─────────────────┐     ┌─────────────────────────┐   │
│  │    Vercel        │     │        Render            │   │
│  │                 │     │                         │   │
│  │  React SPA      │────▶│  Node.js + Express      │   │
│  │  (Static Build) │     │  (Web Service)          │   │
│  │                 │     │  PORT: 5000             │   │
│  │  ticketiq.vercel│     │  ticketiq-api.render.com│   │
│  └─────────────────┘     └────────────┬────────────┘   │
│                                       │                 │
│                                       │ Mongoose        │
│                                       ▼                 │
│                          ┌────────────────────────┐     │
│                          │    MongoDB Atlas        │     │
│                          │    (Free Tier M0)       │     │
│                          │    cluster.mongodb.net  │     │
│                          └────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 15.2 Build & Deploy Commands

```bash
# Frontend — Vercel auto-deploys from GitHub
# Build command:
npm run build
# Output directory: dist

# Backend — Render auto-deploys from GitHub
# Start command:
node server.js
# Or with nodemon for development:
npm run dev

# Environment variables set in Render dashboard:
MONGO_URI    = mongodb+srv://...
JWT_SECRET   = ...
JWT_EXPIRE   = 7d
CLIENT_URL   = https://ticketiq.vercel.app
PORT         = 5000
```

### 15.3 CORS Configuration for Production

```js
// server.js
app.use(cors({
  origin      : process.env.CLIENT_URL,   // exact Vercel URL
  credentials : true,                     // allow cookies
  methods     : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 15.4 Development vs Production

| Config | Development | Production |
|---|---|---|
| API URL | `http://localhost:5000` | `https://ticketiq-api.render.com` |
| MongoDB | Local or Atlas dev cluster | Atlas production cluster |
| JWT Cookie | `secure: false` | `secure: true, sameSite: 'none'` |
| CORS origin | `http://localhost:5173` | Vercel production URL |
| Error stack | Shown in response | Hidden (log only) |
| nodemon | Yes (`npm run dev`) | No (`node server.js`) |

---

*TicketIQ © 2026 — Software Engineering Subject Project*
