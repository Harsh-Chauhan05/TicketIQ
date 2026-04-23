# TicketIQ — 05. Database Schema

> **Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document ID | 05-database-schema |
| Version | 1.0.0 |
| Database | MongoDB Atlas (NoSQL) |
| ODM | Mongoose |
| Collections | 5 |
| Date | March 2026 |

---

## 1. Database Overview

```
Database: ticketiq
│
├── users              → User accounts (customers, agents, admins)
├── tickets            → Support tickets with priority + SLA data
├── domains            → Domain rules for keyword-to-priority mapping
├── slapolicies        → SLA policies per priority per domain
└── notifications      → In-app notifications for breach alerts
```

### Multi-Tenancy

All collections are logically isolated using `tenantId`. Every document includes a `tenantId` field, and every query must filter by it to prevent cross-tenant data access.

---

## 2. Collection: `users`

### Schema Definition

```js
const userSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: 8,
    select: false  // excluded from queries by default
  },
  role: {
    type: String,
    enum: ['customer', 'agent', 'admin'],
    required: true
  },
  domain: {
    type: String,
    enum: ['banking', 'ecommerce', 'healthcare', 'edtech'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });
```

### Indexes

| Index | Type | Purpose |
|---|---|---|
| `{ email: 1 }` | Unique | Fast email lookup, prevent duplicates |
| `{ tenantId: 1, role: 1 }` | Compound | Filter users by tenant and role |

### Pre-save Hook

```js
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
```

### Instance Methods

```js
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

### Field Summary

| Field | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | Auto-generated | Primary key |
| `tenantId` | ObjectId | Yes | — | FK → domains |
| `name` | String | Yes | — | max 100 chars, trimmed |
| `email` | String | Yes | — | unique, lowercase |
| `password` | String | Yes | — | min 8 chars, bcrypt hashed |
| `role` | Enum | Yes | — | customer / agent / admin |
| `domain` | Enum | Yes | — | banking / ecommerce / healthcare / edtech |
| `isActive` | Boolean | No | `true` | Active/inactive toggle |
| `createdAt` | Date | Auto | — | Mongoose timestamps |
| `updatedAt` | Date | Auto | — | Mongoose timestamps |

---

## 3. Collection: `tickets`

### Schema Definition

```js
const ticketSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  ticketNumber: {
    type: String,
    unique: true,
    required: true
    // Format: TKT-00001, TKT-00042, etc.
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxLength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxLength: 2000
  },
  category: {
    type: String,
    trim: true
    // e.g., 'Payment', 'Delivery', 'Technical'
  },
  domain: {
    type: String,
    enum: ['banking', 'ecommerce', 'healthcare', 'edtech'],
    required: true
  },
  userPriority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true
  },
  systemPriority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true
  },
  finalPriority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true
    // max(userPriority, systemPriority)
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  slaDeadline: {
    type: Date,
    required: true
    // Calculated: createdAt + resolutionTimeMin
  },
  slaBreached: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  internalNotes: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
```

### Indexes

| Index | Type | Purpose |
|---|---|---|
| `{ ticketNumber: 1 }` | Unique | Fast ticket number lookup |
| `{ tenantId: 1, status: 1 }` | Compound | Filter by tenant + status |
| `{ tenantId: 1, finalPriority: 1 }` | Compound | Priority-sorted queue |
| `{ tenantId: 1, slaBreached: 1 }` | Compound | SLA breach queries |
| `{ tenantId: 1, slaDeadline: 1 }` | Compound | Cron job breach scan |
| `{ createdBy: 1 }` | Single | Customer ticket history |
| `{ assignedTo: 1 }` | Single | Agent queue lookup |

### Ticket Number Auto-Generation

```js
const generateTicketNumber = async (tenantId) => {
  const count = await Ticket.countDocuments({ tenantId });
  return `TKT-${String(count + 1).padStart(5, '0')}`;
  // TKT-00001, TKT-00002, ... TKT-00042
};
```

### Field Summary

| Field | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | — | Primary key |
| `tenantId` | ObjectId | Yes | — | Tenant isolation |
| `ticketNumber` | String | Yes | — | unique, TKT-XXXXX |
| `title` | String | Yes | — | max 200 chars |
| `description` | String | Yes | — | max 2000 chars |
| `category` | String | No | — | Free text |
| `domain` | Enum | Yes | — | 4 domains |
| `userPriority` | Enum | Yes | — | 4 priority levels |
| `systemPriority` | Enum | Yes | — | Set by engine |
| `finalPriority` | Enum | Yes | — | max(user, system) |
| `status` | Enum | No | `open` | 4 statuses |
| `slaDeadline` | Date | Yes | — | Calculated at creation |
| `slaBreached` | Boolean | No | `false` | Set by cron job |
| `createdBy` | ObjectId | Yes | — | FK → users (customer) |
| `assignedTo` | ObjectId | No | `null` | FK → users (agent) |
| `comments` | Array | No | `[]` | Embedded sub-docs |
| `internalNotes` | Array | No | `[]` | Embedded sub-docs |

---

## 4. Collection: `domains`

### Schema Definition

```js
const domainSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    enum: ['banking', 'ecommerce', 'healthcare', 'edtech'],
    required: true
  },
  rules: [{
    keyword: {
      type: String,
      required: true
      // Comma-separated keywords, e.g., "payment failed, transaction declined"
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      required: true
    }
  }]
}, { timestamps: true });
```

### Indexes

| Index | Type | Purpose |
|---|---|---|
| `{ tenantId: 1, name: 1 }` | Unique compound | One domain config per tenant |

### Field Summary

| Field | Type | Required | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `tenantId` | ObjectId | Yes | Tenant isolation |
| `name` | Enum | Yes | 4 domain types |
| `rules` | Array | No | Embedded keyword-priority rules |
| `rules[].keyword` | String | Yes | Comma-separated keywords |
| `rules[].priority` | Enum | Yes | 4 priority levels |

---

## 5. Collection: `slapolicies`

### Schema Definition

```js
const slaPolicySchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  domain: {
    type: String,
    enum: ['banking', 'ecommerce', 'healthcare', 'edtech'],
    required: true
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true
  },
  resolutionTimeMin: {
    type: Number,
    required: true
    // Minutes to resolve the ticket
  },
  escalateAfterMin: {
    type: Number,
    required: true
    // Minutes before escalation alert
  }
}, { timestamps: true });
```

### Indexes

| Index | Type | Purpose |
|---|---|---|
| `{ tenantId: 1, domain: 1, priority: 1 }` | Unique compound | One policy per priority per domain per tenant |

### Default Seed Data

| Priority | resolutionTimeMin | escalateAfterMin |
|---|---|---|
| CRITICAL | 60 | 45 |
| HIGH | 240 | 180 |
| MEDIUM | 1440 | 1200 |
| LOW | 4320 | 3600 |

### Field Summary

| Field | Type | Required | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `tenantId` | ObjectId | Yes | Tenant isolation |
| `domain` | Enum | Yes | 4 domains |
| `priority` | Enum | Yes | 4 priority levels |
| `resolutionTimeMin` | Number | Yes | Minutes to resolution |
| `escalateAfterMin` | Number | Yes | Minutes before escalation |

---

## 6. Collection: `notifications`

### Schema Definition

```js
const notificationSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // Recipient of the notification
  },
  type: {
    type: String,
    enum: ['sla_breach', 'sla_warning', 'ticket_assigned', 'status_update'],
    required: true
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });
```

### Indexes

| Index | Type | Purpose |
|---|---|---|
| `{ userId: 1, isRead: 1 }` | Compound | Unread notification fetch |
| `{ tenantId: 1 }` | Single | Tenant-scoped queries |

### Field Summary

| Field | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | — | Primary key |
| `tenantId` | ObjectId | Yes | — | Tenant isolation |
| `userId` | ObjectId | Yes | — | FK → users (recipient) |
| `type` | Enum | Yes | — | 4 notification types |
| `ticketId` | ObjectId | Yes | — | FK → tickets |
| `message` | String | Yes | — | Notification text |
| `isRead` | Boolean | No | `false` | Read status |

---

## 7. Entity Relationship Diagram

```
users ──────────────────── tickets
  │  (1 customer : many tickets via createdBy)
  │  (1 agent : many tickets via assignedTo)
  │
  │───────────── notifications
  │  (1 user : many notifications via userId)
  │
  └───────────── domains ───── slapolicies
                 (tenantId)     (tenantId + domain + priority)
```

### Relationships

| From | To | Type | Join Field |
|---|---|---|---|
| User | Ticket | 1:N | `createdBy` (customer creates tickets) |
| User | Ticket | 1:N | `assignedTo` (agent assigned tickets) |
| User | Notification | 1:N | `userId` (notification recipient) |
| Ticket | Notification | 1:N | `ticketId` (notification about ticket) |
| Domain | User | Logical | Shared `tenantId` |
| SLAPolicy | Ticket | Logical | Matched by `domain + priority` |

---

## 8. Data Retention & Storage Notes

| Aspect | Detail |
|---|---|
| Storage Limit | MongoDB Atlas free tier: 512MB |
| TTL Indexes | Not applied in MVP (sufficient for demo) |
| Archival | Resolved tickets remain in active collection |
| Backup | MongoDB Atlas automatic daily backups |
| Data Volume Estimate | ~10,000 tickets sufficient for project demo |

---

*TicketIQ © 2026 — Software Engineering Subject Project*
