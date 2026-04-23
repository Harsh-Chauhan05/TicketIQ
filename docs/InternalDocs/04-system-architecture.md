# TicketIQ — 04. System Architecture

> **Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document ID | 04-system-architecture |
| Version | 1.0.0 |
| Architecture Style | Monolithic MERN — Service-Separated |
| Date | March 2026 |

---

## 1. Architecture Overview

TicketIQ follows a **three-tier client-server architecture** where a React SPA frontend communicates with a Node.js/Express backend via RESTful APIs, with MongoDB as the persistent data store. The system is organized around the concept of **Tenants** — each business gets an isolated logical environment.

### 1.1 Architecture Decisions

| Decision | Rationale |
|---|---|
| Monolithic MERN | Simple to build for single developer, adequate for MVP scale |
| RESTful APIs (JSON) | Standard, well-understood, easy to test with Postman |
| JWT Authentication | Stateless, scalable, no server-side session management |
| Logical Multi-Tenancy | tenantId on every document — no separate databases needed |
| node-cron for SLA | Simple scheduling within the same process, reliable for MVP |
| React Context API | Sufficient for auth + notification state without Redux complexity |

---

## 2. High-Level Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                                                                 │
│   ┌────────────────────────────────────────────────────────┐   │
│   │              React SPA (Vite + Tailwind CSS)           │   │
│   │                                                        │   │
│   │   Auth Pages │ Customer Pages │ Agent Pages │ Admin    │   │
│   │                                                        │   │
│   │   Context: AuthContext │ NotificationContext            │   │
│   │   HTTP Client: Axios (withCredentials: true)           │   │
│   └────────────────────────────────────────────────────────┘   │
│                          │ HTTP REST (JSON)                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    SERVER LAYER                                   │
│                          ▼                                        │
│   ┌────────────────────────────────────────────────────────┐    │
│   │              Express.js Application                     │    │
│   │                                                        │    │
│   │   Routes          Middleware        Controllers        │    │
│   │   /api/auth   →   JWT Auth      →   authController    │    │
│   │   /api/tickets→   Role Check    →   ticketController  │    │
│   │   /api/domains→   Validation    →   domainController  │    │
│   │   /api/sla    →   tenantId      →   slaController     │    │
│   │   /api/users  →                 →   userController    │    │
│   │   /api/notif..→                 →   notifController   │    │
│   │                                                        │    │
│   │   ┌─────────────────────────────────────────────┐     │    │
│   │   │              Services Layer                  │     │    │
│   │   │  priorityEngine.js  │  slaMonitor.js (cron) │     │    │
│   │   └─────────────────────────────────────────────┘     │    │
│   └────────────────────────────────────────────────────────┘    │
│                          │ Mongoose ODM                           │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    DATA LAYER                                     │
│                          ▼                                        │
│   ┌────────────────────────────────────────────────────────┐    │
│   │                  MongoDB Atlas                          │    │
│   │                                                        │    │
│   │   users │ tickets │ domains │ slapolicies │ notifications│   │
│   └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| React.js | 18.x | UI component library, SPA |
| React Router | v6 | Client-side routing |
| Axios | Latest | HTTP API calls with interceptors |
| React Context API | Built-in | Global state (auth, notifications) |
| Tailwind CSS | 3.x | Utility-first CSS styling |
| Recharts | Latest | Charts for analytics dashboards |
| React Hook Form | Latest | Form validation and management |
| Lucide React | Latest | Icon library |
| Vite | Latest | Build tool and dev server |

### 3.2 Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18.x+ | JavaScript runtime |
| Express.js | 4.x | REST API framework |
| Mongoose | 7.x+ | MongoDB ODM |
| jsonwebtoken | Latest | JWT token generation/verification |
| bcryptjs | Latest | Password hashing |
| node-cron | Latest | Scheduled SLA monitoring |
| express-validator | Latest | Request input validation |
| cors | Latest | Cross-origin handling |
| cookie-parser | Latest | Cookie parsing for JWT |
| dotenv | Latest | Environment variable management |

### 3.3 Database & Infrastructure

| Technology | Purpose |
|---|---|
| MongoDB Atlas (Free M0) | Cloud NoSQL database |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| GitHub | Version control |

---

## 4. Request Lifecycle

```
Browser → React App → Axios HTTP Request
    → Express Route
    → cors() middleware
    → express.json() parser
    → cookieParser()
    → authMiddleware (verify JWT, attach req.user)
    → roleMiddleware (check req.user.role)
    → express-validator (validate/sanitize inputs)
    → Controller (execute business logic)
    → Service Layer (priority engine / SLA calc if needed)
    → Mongoose Model (DB operation)
    → MongoDB Atlas
    → JSON Response
    → Axios interceptor processes response
    → React updates UI state
```

---

## 5. Component Architecture

### 5.1 Backend Components

```
server.js (Entry Point)
├── config/
│   └── db.js                    MongoDB connection (mongoose.connect)
├── middleware/
│   ├── authMiddleware.js        JWT verification, user loading
│   └── roleMiddleware.js        Role-based access guard
├── models/
│   ├── User.js                  User schema + password hashing hooks
│   ├── Ticket.js                Ticket schema + indexes
│   ├── Domain.js                Domain rules schema
│   ├── SLAPolicy.js             SLA policy schema
│   └── Notification.js          Notification schema
├── controllers/
│   ├── authController.js        Register, Login, GetMe
│   ├── ticketController.js      CRUD + priority engine integration
│   ├── domainController.js      Domain rules CRUD
│   ├── slaController.js         SLA policy CRUD + reports
│   ├── userController.js        User management (admin)
│   └── notificationController.js   Get/mark-read notifications
├── routes/
│   ├── authRoutes.js
│   ├── ticketRoutes.js
│   ├── domainRoutes.js
│   ├── slaRoutes.js
│   ├── userRoutes.js
│   └── notificationRoutes.js
├── services/
│   ├── priorityEngine.js        Domain rules matching engine
│   └── slaMonitor.js            Cron job for SLA breach detection
└── utils/
    └── apiResponse.js           Standardized response format
```

### 5.2 Frontend Components

```
src/
├── api/
│   ├── axiosInstance.js          Configured Axios with interceptors
│   ├── auth.js                  Auth API calls
│   ├── tickets.js               Ticket API calls
│   ├── domains.js               Domain API calls
│   ├── sla.js                   SLA API calls
│   ├── users.js                 User management API calls
│   └── notifications.js         Notification API calls
├── context/
│   ├── AuthContext.jsx           Auth state + login/logout methods
│   └── NotificationContext.jsx   Notification state + polling
├── components/
│   ├── Navbar.jsx               Top navigation bar
│   ├── Sidebar.jsx              Role-aware sidebar navigation
│   ├── PriorityBadge.jsx        Color-coded priority pill
│   ├── StatusBadge.jsx          Color-coded status pill
│   ├── SLARingTimer.jsx         SVG circular countdown timer
│   ├── StatsCard.jsx            Dashboard metric card
│   ├── TicketRow.jsx            Table row with ticket info
│   ├── ConfirmDialog.jsx        Reusable confirmation modal
│   └── LoadingSpinner.jsx       Loading indicator
├── routes/
│   ├── PrivateRoute.jsx         Auth-required wrapper
│   └── RoleRoute.jsx            Role-specific wrapper
├── pages/
│   ├── auth/ (3 pages)
│   ├── customer/ (5 pages)
│   ├── agent/ (6 pages)
│   └── admin/ (8 pages)
├── utils/
│   ├── priorityColors.js        Priority color mapping
│   └── slaHelpers.js            SLA status calculation
├── App.jsx                      Main app with routing
└── main.jsx                     Entry point
```

---

## 6. Service Layer Design

### 6.1 Priority Engine Service

| Attribute | Detail |
|---|---|
| File | `services/priorityEngine.js` |
| Trigger | Called by ticketController on POST /api/tickets |
| Input | Ticket data (title, description, domain, userPriority) + tenantId |
| Process | Load domain rules → scan text → match keywords → rank priorities |
| Output | `{ systemPriority, finalPriority }` |
| Fallback | On error, use userPriority as both system and final |

### 6.2 SLA Monitor Service

| Attribute | Detail |
|---|---|
| File | `services/slaMonitor.js` |
| Trigger | node-cron schedule: `* * * * *` (every 60 seconds) |
| Process | Query overdue tickets → mark breached → create notifications |
| Query | `{ status: [open, in_progress], slaDeadline < now, slaBreached: false }` |
| Resilience | Continues even if a cycle fails (try-catch) |

---

## 7. Multi-Tenant Architecture

### Isolation Strategy: Logical Multi-Tenancy

All tenants share the same MongoDB database and collections. Every document is tagged with `tenantId`. Every query **must** filter by `tenantId`.

```
Single MongoDB Database
├── Tenant A (Google Pay) ← tenantId: "abc123"
│     Users, Tickets, Domain Rules, SLA Policies
├── Tenant B (Amazon) ← tenantId: "def456"
│     Users, Tickets, Domain Rules, SLA Policies
└── Tenant C (Apollo Hospital) ← tenantId: "ghi789"
      Users, Tickets, Domain Rules, SLA Policies
```

### Enforcement Pattern

```js
// ✅ CORRECT — always filter by tenantId
const tickets = await Ticket.find({ tenantId: req.user.tenantId, status: 'open' });

// ❌ WRONG — cross-tenant data leak
const tickets = await Ticket.find({ status: 'open' });
```

---

## 8. Security Architecture

| Layer | Implementation |
|---|---|
| Authentication | JWT tokens, 7-day expiry, httpOnly cookies |
| Authorization | Role middleware on every protected route |
| Tenant Isolation | tenantId filter on ALL queries |
| Password | bcryptjs (12 salt rounds) |
| Input Validation | express-validator on all POST/PATCH |
| CORS | Whitelist frontend origin only |
| Rate Limiting | express-rate-limit on auth routes (10 req/15min) |
| Secrets | .env file (never committed to Git) |

### Auth Middleware Flow

```
Request arrives → Extract token (cookie or Bearer header)
    → jwt.verify(token, JWT_SECRET)
    → Find user by decoded.id
    → Check user.isActive === true
    → Attach user to req.user
    → Next middleware
```

### Role Middleware

```
Check req.user.role ∈ allowedRoles[]
    → If yes → next()
    → If no  → 403 "Access denied"
```

---

## 9. Deployment Architecture

```
┌────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                     │
│                                                        │
│  ┌─────────────────┐     ┌─────────────────────────┐  │
│  │    Vercel        │     │        Render            │  │
│  │  React SPA      │────▶│  Node.js + Express       │  │
│  │  (Static Build) │     │  PORT: 5000              │  │
│  └─────────────────┘     └──────────┬──────────────┘  │
│                                     │ Mongoose         │
│                                     ▼                  │
│                          ┌────────────────────────┐    │
│                          │    MongoDB Atlas        │    │
│                          │    (Free M0 Tier)       │    │
│                          └────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

### Environment Configuration

```bash
# Backend (.env)
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ticketiq
JWT_SECRET=<your_secret_key>
JWT_EXPIRE=7d
PORT=5000
CLIENT_URL=https://ticketiq.vercel.app

# Frontend (.env)
VITE_API_URL=https://ticketiq-api.render.com
```

### Development vs Production

| Config | Development | Production |
|---|---|---|
| API URL | `http://localhost:5000` | `https://ticketiq-api.render.com` |
| MongoDB | Local or Atlas dev cluster | Atlas production cluster |
| JWT Cookie | `secure: false` | `secure: true, sameSite: 'none'` |
| CORS origin | `http://localhost:5173` | Vercel production URL |
| Error stack | Shown in response | Hidden (log only) |

---

## 10. Error Handling Architecture

### Backend

- **Mongoose ValidationError** → 400 with field-level errors
- **Duplicate key (11000)** → 400 with field name
- **JWT errors** → 401 "Invalid token"
- **Role denied** → 403 "Access denied"
- **Not found** → 404 "Resource not found"
- **Unhandled** → 500 "Internal server error"

### Frontend

- **401 Unauthorized** → Redirect to /login (axios interceptor)
- **403 Forbidden** → Show "Access Denied" page
- **Network error** → Show "Connection lost" banner
- **API error** → Show inline error message
- **Empty state** → Show illustrated empty state with CTA

---

*TicketIQ © 2026 — Software Engineering Subject Project*
