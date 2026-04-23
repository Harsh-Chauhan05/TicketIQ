# TicketIQ — 06. API Contracts

> **Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document ID | 06-api-contracts |
| Version | 1.0.0 |
| Base URL | `/api` |
| Total Endpoints | 23 |
| Auth Method | JWT (httpOnly cookie / Bearer token) |
| Date | March 2026 |

---

## 1. API Design Principles

- All routes prefixed with `/api/`
- All responses use consistent JSON format
- All protected routes require `Authorization: Bearer <token>` header or httpOnly cookie
- All tenant-scoped queries include `tenantId` filter automatically
- HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error)

### Standard Response Format

```json
// Success
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Error description"
}

// Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "title", "message": "Title is required" }
  ]
}
```

---

## 2. Auth Routes — `/api/auth`

### POST `/api/auth/register`

**Description:** Register a new user account

| Attribute | Value |
|---|---|
| Access | Public |
| Auth Required | No |

**Request Body:**
```json
{
  "name": "Rahul Mehta",
  "email": "rahul@example.com",
  "password": "SecurePass123",
  "role": "customer",
  "domain": "banking"
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| name | Required, max 100 chars |
| email | Required, valid email format, unique |
| password | Required, min 8 chars |
| role | Required, enum: customer / agent / admin |
| domain | Required, enum: banking / ecommerce / healthcare / edtech |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
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

**Error Responses:**
| Status | Message |
|---|---|
| 400 | "Email already registered" |
| 400 | Validation errors array |

---

### POST `/api/auth/login`

**Description:** Login with email and password

| Attribute | Value |
|---|---|
| Access | Public |
| Auth Required | No |

**Request Body:**
```json
{
  "email": "rahul@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Rahul Mehta",
      "email": "rahul@example.com",
      "role": "customer",
      "domain": "banking",
      "tenantId": "64f1a2b3c4d5e6f7a8b9c0d2"
    }
  }
}
```

**Error Responses:**
| Status | Message |
|---|---|
| 401 | "Invalid email or password" |
| 403 | "Account deactivated" |

---

### GET `/api/auth/me`

**Description:** Get current authenticated user profile

| Attribute | Value |
|---|---|
| Access | Private |
| Auth Required | Yes (any role) |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Rahul Mehta",
    "email": "rahul@example.com",
    "role": "customer",
    "domain": "banking",
    "tenantId": "64f1a2b3c4d5e6f7a8b9c0d2",
    "isActive": true,
    "createdAt": "2026-03-01T00:00:00.000Z"
  }
}
```

---

## 3. Ticket Routes — `/api/tickets`

### POST `/api/tickets`

**Description:** Create a new support ticket. Triggers priority engine and SLA deadline calculation.

| Attribute | Value |
|---|---|
| Access | Customer only |
| Auth Required | Yes |

**Request Body:**
```json
{
  "title": "My payment failed twice today",
  "description": "Transaction was declined. Money deducted but not transferred.",
  "category": "Payment",
  "userPriority": "medium"
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| title | Required, max 200 chars |
| description | Required, max 2000 chars |
| category | Optional |
| userPriority | Required, enum: critical / high / medium / low |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "ticketNumber": "TKT-00042",
    "title": "My payment failed twice today",
    "description": "Transaction was declined...",
    "category": "Payment",
    "domain": "banking",
    "userPriority": "medium",
    "systemPriority": "critical",
    "finalPriority": "critical",
    "status": "open",
    "slaDeadline": "2026-03-16T15:30:00.000Z",
    "slaBreached": false,
    "createdBy": "64f1a2b3c4d5e6f7a8b9c0d1",
    "createdAt": "2026-03-16T14:30:00.000Z"
  }
}
```

---

### GET `/api/tickets`

**Description:** Get tickets filtered by role and tenant

| Attribute | Value |
|---|---|
| Access | All authenticated roles |
| Auth Required | Yes |

**Query Parameters:**

| Param | Type | Description | Example |
|---|---|---|---|
| status | String | Filter by status | `?status=open` |
| priority | String | Filter by finalPriority | `?priority=critical` |
| domain | String | Filter by domain | `?domain=banking` |
| page | Number | Page number | `?page=1` |
| limit | Number | Results per page | `?limit=10` |

**Role-Based Filtering:**
| Role | Sees |
|---|---|
| Customer | Only own tickets (`createdBy = req.user._id`) |
| Agent | Tickets assigned to them or their domain |
| Admin | All tickets in the tenant |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [ /* ticket objects */ ],
    "total": 48,
    "page": 1,
    "pages": 5
  }
}
```

---

### GET `/api/tickets/:id`

**Description:** Get a single ticket's full details

| Attribute | Value |
|---|---|
| Access | All (own ticket or assigned/admin) |
| Auth Required | Yes |

**URL Params:** `id` — Ticket ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "ticketNumber": "TKT-00042",
    "title": "My payment failed twice today",
    "description": "...",
    "userPriority": "medium",
    "systemPriority": "critical",
    "finalPriority": "critical",
    "status": "open",
    "slaDeadline": "2026-03-16T15:30:00.000Z",
    "slaBreached": false,
    "createdBy": { "_id": "...", "name": "Rahul Mehta" },
    "assignedTo": { "_id": "...", "name": "Priya Sharma" },
    "comments": [],
    "internalNotes": [],
    "createdAt": "2026-03-16T14:30:00.000Z"
  }
}
```

---

### PATCH `/api/tickets/:id/status`

**Description:** Update ticket status

| Attribute | Value |
|---|---|
| Access | Agent, Admin |
| Auth Required | Yes |

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Allowed Transitions:** open → in_progress → resolved → closed

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ticket status updated to in_progress",
  "data": { /* updated ticket */ }
}
```

---

### PATCH `/api/tickets/:id/priority`

**Description:** Override ticket priority (admin only)

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

**Request Body:**
```json
{
  "priority": "critical",
  "reason": "Customer is a VIP — escalating urgency"
}
```

---

### PATCH `/api/tickets/:id/assign`

**Description:** Assign ticket to a specific agent

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

**Request Body:**
```json
{
  "agentId": "64f1a2b3c4d5e6f7a8b9c0d3"
}
```

---

### POST `/api/tickets/:id/comment`

**Description:** Add a public comment to a ticket

| Attribute | Value |
|---|---|
| Access | Customer, Agent, Admin |
| Auth Required | Yes |

**Request Body:**
```json
{
  "message": "I tried again and it still fails"
}
```

---

### POST `/api/tickets/:id/note`

**Description:** Add an internal note (not visible to customer)

| Attribute | Value |
|---|---|
| Access | Agent, Admin |
| Auth Required | Yes |

**Request Body:**
```json
{
  "note": "Checked payment gateway — processing error on bank side"
}
```

---

### GET `/api/tickets/sla/breached`

**Description:** Get all SLA-breached tickets

| Attribute | Value |
|---|---|
| Access | Agent, Admin |
| Auth Required | Yes |

---

### GET `/api/tickets/sla/atrisk`

**Description:** Get tickets near SLA breach (< 30 minutes remaining)

| Attribute | Value |
|---|---|
| Access | Agent, Admin |
| Auth Required | Yes |

---

## 4. Domain Routes — `/api/domains`

### GET `/api/domains`

**Description:** Get domain configuration and rules for tenant

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "banking",
    "tenantId": "...",
    "rules": [
      { "_id": "...", "keyword": "payment failed, transaction failed", "priority": "critical" },
      { "_id": "...", "keyword": "wrong balance, missing funds", "priority": "high" }
    ]
  }
}
```

---

### POST `/api/domains/rules`

**Description:** Add a new domain keyword rule

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

**Request Body:**
```json
{
  "keyword": "fraud detected, suspicious transaction",
  "priority": "critical"
}
```

---

### PUT `/api/domains/rules/:id`

**Description:** Update an existing domain rule

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

**Request Body:**
```json
{
  "keyword": "fraud alert, suspicious activity",
  "priority": "critical"
}
```

---

### DELETE `/api/domains/rules/:id`

**Description:** Delete a domain rule

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

---

## 5. SLA Routes — `/api/sla`

### GET `/api/sla/policies`

**Description:** Get all SLA policies for tenant

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    { "priority": "critical", "resolutionTimeMin": 60, "escalateAfterMin": 45 },
    { "priority": "high", "resolutionTimeMin": 240, "escalateAfterMin": 180 },
    { "priority": "medium", "resolutionTimeMin": 1440, "escalateAfterMin": 1200 },
    { "priority": "low", "resolutionTimeMin": 4320, "escalateAfterMin": 3600 }
  ]
}
```

---

### POST `/api/sla/policies`

**Description:** Create an SLA policy

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

---

### PUT `/api/sla/policies/:id`

**Description:** Update an SLA policy

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

**Request Body:**
```json
{
  "resolutionTimeMin": 120,
  "escalateAfterMin": 90
}
```

---

### GET `/api/sla/reports`

**Description:** Get SLA analytics/reports data

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

**Query Parameters:** `?startDate=2026-03-01&endDate=2026-03-15`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalTickets": 142,
    "resolvedOnTime": 118,
    "slaBreached": 24,
    "breachRate": 16.9,
    "breachByPriority": {
      "critical": 2,
      "high": 8,
      "medium": 12,
      "low": 2
    }
  }
}
```

---

## 6. User Routes — `/api/users`

### GET `/api/users`

**Description:** Get all users in the tenant

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

---

### GET `/api/users/:id`

**Description:** Get single user details

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

---

### PATCH `/api/users/:id`

**Description:** Update user information or role

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

---

### PATCH `/api/users/:id/toggle`

**Description:** Activate or deactivate a user

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

---

### DELETE `/api/users/:id`

**Description:** Remove a user

| Attribute | Value |
|---|---|
| Access | Admin only |
| Auth Required | Yes |

---

## 7. Notification Routes — `/api/notifications`

### GET `/api/notifications`

**Description:** Get notifications for current user

| Attribute | Value |
|---|---|
| Access | All authenticated |
| Auth Required | Yes |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "...",
        "type": "sla_breach",
        "message": "⚠ SLA breached for ticket TKT-00042 [CRITICAL]",
        "ticketId": { "ticketNumber": "TKT-00042", "title": "..." },
        "isRead": false,
        "createdAt": "2026-03-16T15:30:00.000Z"
      }
    ],
    "unreadCount": 3
  }
}
```

---

### PATCH `/api/notifications/read-all`

**Description:** Mark all notifications as read

| Attribute | Value |
|---|---|
| Access | All authenticated |
| Auth Required | Yes |

---

## 8. API Endpoint Summary

| # | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| 1 | POST | `/api/auth/register` | Public | Register user |
| 2 | POST | `/api/auth/login` | Public | Login |
| 3 | GET | `/api/auth/me` | Private | Get current user |
| 4 | POST | `/api/tickets` | Customer | Create ticket |
| 5 | GET | `/api/tickets` | All | Get tickets (role-filtered) |
| 6 | GET | `/api/tickets/:id` | All | Get single ticket |
| 7 | PATCH | `/api/tickets/:id/status` | Agent, Admin | Update status |
| 8 | PATCH | `/api/tickets/:id/priority` | Admin | Override priority |
| 9 | PATCH | `/api/tickets/:id/assign` | Admin | Assign to agent |
| 10 | POST | `/api/tickets/:id/comment` | All | Add comment |
| 11 | POST | `/api/tickets/:id/note` | Agent, Admin | Add internal note |
| 12 | GET | `/api/tickets/sla/breached` | Agent, Admin | Breached tickets |
| 13 | GET | `/api/tickets/sla/atrisk` | Agent, Admin | At-risk tickets |
| 14 | GET | `/api/domains` | Admin | Get domain rules |
| 15 | POST | `/api/domains/rules` | Admin | Add rule |
| 16 | PUT | `/api/domains/rules/:id` | Admin | Update rule |
| 17 | DELETE | `/api/domains/rules/:id` | Admin | Delete rule |
| 18 | GET | `/api/sla/policies` | Admin | Get SLA policies |
| 19 | POST | `/api/sla/policies` | Admin | Create policy |
| 20 | PUT | `/api/sla/policies/:id` | Admin | Update policy |
| 21 | GET | `/api/sla/reports` | Admin | Get SLA reports |
| 22 | GET | `/api/users` | Admin | List users |
| 23 | PATCH | `/api/users/:id/toggle` | Admin | Toggle user |

---

*TicketIQ © 2026 — Software Engineering Subject Project*
