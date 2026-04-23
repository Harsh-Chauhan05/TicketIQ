# TicketIQ — 03. Information Architecture

> **Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document ID | 03-information-architecture |
| Version | 1.0.0 |
| Total Pages | 22 |
| Date | March 2026 |

---

## 1. Site Map Overview

```
TicketIQ Application
│
├── Public Pages (No Auth Required)
│   ├── /login                     → Login Page
│   ├── /register                  → Registration Page
│   └── /forgot-password           → Forgot Password Page
│
├── Customer Portal (/customer/*)
│   ├── /customer/dashboard        → Customer Dashboard
│   ├── /customer/submit           → Submit New Ticket
│   ├── /customer/tickets          → Ticket History (All Tickets)
│   ├── /customer/tickets/:id      → Ticket Detail View
│   └── /customer/profile          → Customer Profile
│
├── Agent Portal (/agent/*)
│   ├── /agent/dashboard           → Agent Dashboard
│   ├── /agent/queue               → Ticket Queue (Priority Sorted)
│   ├── /agent/tickets/:id         → Ticket Detail View
│   ├── /agent/sla-monitor         → SLA Monitor (Breach/At-Risk/Safe)
│   ├── /agent/notifications       → Notification Center
│   └── /agent/profile             → Agent Profile
│
└── Admin Portal (/admin/*)
    ├── /admin/dashboard           → Admin Dashboard (Stats Overview)
    ├── /admin/tickets             → Manage All Tickets
    ├── /admin/domain-config       → Domain Rule Configuration
    ├── /admin/sla-settings        → SLA Policy Settings
    ├── /admin/users               → User Management
    ├── /admin/reports             → SLA Performance Reports
    ├── /admin/notifications       → Admin Notifications
    └── /admin/settings            → Tenant Settings
```

---

## 2. Navigation Structure

### 2.1 Global Navigation (All Roles)

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] TicketIQ          [Notification Bell]  [Avatar] │
│                                                [Logout] │
└─────────────────────────────────────────────────────────┘
```

**Top Navbar (Fixed)**
- Logo + Product Name (left)
- Notification bell with unread badge count (right)
- User avatar + dropdown (Profile, Logout) (right)

### 2.2 Customer Sidebar

```
┌──────────────────────┐
│  📊 Dashboard        │ → /customer/dashboard
│  ✏️  Submit Ticket    │ → /customer/submit
│  📋 My Tickets       │ → /customer/tickets
│  👤 Profile          │ → /customer/profile
└──────────────────────┘
```

### 2.3 Agent Sidebar

```
┌──────────────────────┐
│  📊 Dashboard        │ → /agent/dashboard
│  📋 Ticket Queue     │ → /agent/queue
│  ⏱️  SLA Monitor     │ → /agent/sla-monitor
│  🔔 Notifications    │ → /agent/notifications
│  👤 Profile          │ → /agent/profile
└──────────────────────┘
```

### 2.4 Admin Sidebar

```
┌──────────────────────┐
│  📊 Dashboard        │ → /admin/dashboard
│  📋 Manage Tickets   │ → /admin/tickets
│  ⚙️  Domain Config   │ → /admin/domain-config
│  ⏱️  SLA Settings    │ → /admin/sla-settings
│  👥 Users            │ → /admin/users
│  📈 SLA Reports      │ → /admin/reports
│  🔔 Notifications    │ → /admin/notifications
│  🏢 Tenant Settings  │ → /admin/settings
└──────────────────────┘
```

---

## 3. Page Content Architecture

### 3.1 Auth Pages

#### Login Page (`/login`)

| Section | Content |
|---|---|
| Form Fields | Email, Password |
| Actions | Login button, "Forgot Password?" link, "Register" link |
| Redirect | Role-based → `/customer/dashboard`, `/agent/dashboard`, or `/admin/dashboard` |

#### Register Page (`/register`)

| Section | Content |
|---|---|
| Form Fields | Full Name, Email, Password, Confirm Password, Role (dropdown), Domain (dropdown) |
| Actions | Register button, "Already have account? Login" link |
| Validation | Inline field errors, email format, password strength, domain selection required |

#### Forgot Password Page (`/forgot-password`)

| Section | Content |
|---|---|
| Form Fields | Email |
| Actions | Send Reset Link button, "Back to Login" link |

---

### 3.2 Customer Pages

#### Customer Dashboard (`/customer/dashboard`)

```
┌─────────────────────────────────────────────────┐
│  Stats Cards Row                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Total    │ │ Open     │ │ Resolved │        │
│  │ Tickets  │ │ Tickets  │ │ Tickets  │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│  Recent Tickets Table                           │
│  ┌──────────────────────────────────────────┐   │
│  │ # │ Title │ Priority │ Status │ SLA │ Date│  │
│  │   │       │  Badge   │ Badge  │Timer│     │  │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  [+ Submit New Ticket] button                   │
└─────────────────────────────────────────────────┘
```

#### Submit Ticket Page (`/customer/submit`)

| Section | Content |
|---|---|
| Form | Title, Description (textarea), Category (dropdown), Priority (dropdown) |
| Priority Override Alert | "System has upgraded your priority to CRITICAL based on issue keywords" |
| Actions | Submit button, Cancel button |

#### Ticket Detail Page (`/customer/tickets/:id`)

```
┌─────────────────────────────────────────────────┐
│  Ticket Header                                  │
│  TKT-00042 │ Priority Badge │ Status Badge      │
│                                                 │
│  SLA Ring Timer (large)                         │
│  ┌──────────────────────┐                       │
│  │   ⏱ 45 min left     │                       │
│  └──────────────────────┘                       │
│                                                 │
│  Ticket Details                                 │
│  Title: My payment failed twice                 │
│  Description: ...                               │
│  Category: Payment │ Domain: Banking            │
│  User Priority: MEDIUM │ Final Priority: CRITICAL│
│  Created: Mar 15 │ SLA Deadline: Mar 15 3:30PM  │
│                                                 │
│  Comments Section                               │
│  ┌──────────────────────┐                       │
│  │ Comment thread       │                       │
│  │ [Add comment input]  │                       │
│  └──────────────────────┘                       │
└─────────────────────────────────────────────────┘
```

#### Ticket History Page (`/customer/tickets`)

| Section | Content |
|---|---|
| Filters | Status dropdown, Priority dropdown, Date range |
| Table | Ticket Number, Title, Priority Badge, Status Badge, SLA Timer, Created Date |
| Empty State | "No tickets yet — submit your first ticket!" |

---

### 3.3 Agent Pages

#### Agent Dashboard (`/agent/dashboard`)

```
┌─────────────────────────────────────────────────┐
│  Stats Cards Row                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────┐│
│  │ Assigned │ │ SLA      │ │ Resolved │ │ At  ││
│  │ Tickets  │ │ Breached │ │ Today    │ │Risk ││
│  └──────────┘ └──────────┘ └──────────┘ └─────┘│
│                                                 │
│  Urgent Tickets (CRITICAL + HIGH)               │
│  ┌──────────────────────────────────────────┐   │
│  │ Priority-sorted ticket cards with timers │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

#### Ticket Queue (`/agent/queue`)

| Section | Content |
|---|---|
| Filters | Priority, Status, SLA Status (Breached/At-Risk/Safe) |
| Sorting | Default: finalPriority DESC (CRITICAL first) |
| Table | Ticket #, Title, Priority Badge, Status, SLA Ring Timer, Customer Name, Date |
| Row Click | Navigate to `/agent/tickets/:id` |

#### Agent Ticket Detail (`/agent/tickets/:id`)

| Section | Content |
|---|---|
| Header | Ticket #, Priority, Status, SLA Timer (large) |
| Details | Title, Description, Category, Domain, Created By, Dates |
| Status Update | Dropdown: Open → In Progress → Resolved |
| Comments | Public comments thread (customer + agent) |
| Internal Notes | Private notes section (agent/admin only) |
| Actions | Update Status, Add Comment, Add Internal Note |

#### SLA Monitor (`/agent/sla-monitor`)

```
┌─────────────────────────────────────────────────┐
│  Three-Lane View                                │
│                                                 │
│  🔴 BREACHED        🟠 AT RISK       🟢 ON TRACK│
│  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │ TKT-00012  │  │ TKT-00018  │  │ TKT-00025│  │
│  │ CRITICAL   │  │ HIGH       │  │ MEDIUM   │  │
│  │ -15min     │  │ 28min left │  │ 4h 12m   │  │
│  ├────────────┤  ├────────────┤  ├──────────┤  │
│  │ TKT-00008  │  │ TKT-00022  │  │ TKT-00030│  │
│  └────────────┘  └────────────┘  └──────────┘  │
└─────────────────────────────────────────────────┘
```

---

### 3.4 Admin Pages

#### Admin Dashboard (`/admin/dashboard`)

```
┌─────────────────────────────────────────────────┐
│  Stats Cards Row                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────┐│
│  │ Total    │ │ SLA      │ │ Active   │ │Breach│
│  │ Tickets  │ │ Breach % │ │ Agents   │ │Count ││
│  └──────────┘ └──────────┘ └──────────┘ └─────┘│
│                                                 │
│  All Tickets Table (with all filters)           │
│  ┌──────────────────────────────────────────┐   │
│  │ Filters: Domain | Priority | Status | Date│  │
│  │ #│Title│Priority│Status│SLA│Agent│Customer│  │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

#### Domain Configuration (`/admin/domain-config`)

| Section | Content |
|---|---|
| Header | Current Domain name badge |
| Rules Table | Keyword, Priority, Actions (Edit/Delete) |
| Add Rule | Form: Keyword input + Priority dropdown + Save button |
| Validation | Keyword required, priority required, duplicate keyword warning |

#### SLA Settings (`/admin/sla-settings`)

| Section | Content |
|---|---|
| SLA Table | Priority Level, Resolution Time (min), Escalation After (min) |
| Edit | Each row has an edit button → inline edit or modal |
| Note | "Changes apply to new tickets only" |

#### User Management (`/admin/users`)

| Section | Content |
|---|---|
| Users Table | Name, Email, Role, Domain, Status (Active/Inactive), Actions |
| Actions | Activate/Deactivate toggle, View details |
| Confirmation | Deactivation requires confirm dialog |

#### SLA Reports (`/admin/reports`)

| Section | Content |
|---|---|
| Filters | Date range selector |
| Summary Cards | Total tickets, Resolved on time, SLA breached, Breach rate % |
| Breakdown | Breach rate by priority level (table) |
| Agent Table | Agent performance stats |

---

## 4. User Flow Diagrams

### 4.1 Registration & Login Flow

```
Landing Page → /login
    │
    ├── Already have account? → Enter email + password → Login
    │       │
    │       ├── Customer → /customer/dashboard
    │       ├── Agent    → /agent/dashboard
    │       └── Admin    → /admin/dashboard
    │
    └── New user? → /register → Fill form → Register
                                    │
                                    └── Auto-login → Role-based redirect
```

### 4.2 Ticket Lifecycle Flow

```
Customer: /customer/submit → Fill form → Submit
    │
    ├── Priority Engine runs → systemPriority assigned
    ├── SLA Deadline calculated → slaDeadline stored
    └── Ticket created → TKT-00042
                │
Agent: /agent/queue → See ticket → Click → /agent/tickets/:id
    │
    ├── Update status → "In Progress"
    ├── Add internal note
    ├── Resolve ticket → "Resolved"
    │
    └── OR SLA breaches → Cron flags → Notification sent
                │
Admin: /admin/tickets → View all → Override priority if needed
```

### 4.3 Admin Configuration Flow

```
Admin: /admin/domain-config → View rules → Add/Edit/Delete
    │
Admin: /admin/sla-settings → View SLA table → Edit times
    │
Admin: /admin/users → View users → Activate/Deactivate
    │
Admin: /admin/reports → Select date range → View SLA metrics
```

---

## 5. Responsive Layout Architecture

### 5.1 Breakpoints

| Breakpoint | Layout |
|---|---|
| Mobile (< 768px) | Sidebar hidden, bottom tab navigation, single column |
| Tablet (768px – 1024px) | Sidebar collapsed to icon-only (60px), main content adjusts |
| Desktop (> 1024px) | Full sidebar (240px), multi-column layout |

### 5.2 Layout Template

```
Desktop Layout:
┌──────────────────────────────────────────────────┐
│                  NAVBAR (fixed top)              │
├──────────┬───────────────────────────────────────┤
│          │                                       │
│ SIDEBAR  │           MAIN CONTENT                │
│ (240px)  │           (flex-1)                    │
│          │                                       │
│          │                                       │
│          │                                       │
└──────────┴───────────────────────────────────────┘

Mobile Layout:
┌──────────────────────────┐
│        NAVBAR            │
├──────────────────────────┤
│                          │
│      MAIN CONTENT        │
│      (full width)        │
│                          │
├──────────────────────────┤
│   BOTTOM TAB NAV         │
└──────────────────────────┘
```

---

## 6. Design System Reference

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| Primary Background | #0A0E1A | Main app background |
| Card Background | #131C35 | Cards, panels |
| Accent (Gold) | #C9A84C | Active sidebar item, highlights |
| Primary Text | #F0F4FF | Main text |
| Secondary Text | #8B9CC8 | Labels, timestamps |

### Priority Colors

| Priority | Background | Border/Text |
|---|---|---|
| CRITICAL | #EF444420 | #EF4444 (Red) |
| HIGH | #F59E0B20 | #F59E0B (Orange) |
| MEDIUM | #3B82F620 | #3B82F6 (Blue) |
| LOW | #22C55E20 | #22C55E (Green) |

### Status Colors

| Status | Color |
|---|---|
| OPEN | #3B82F6 (Blue) |
| IN PROGRESS | #C9A84C (Gold) |
| RESOLVED | #22C55E (Green) |
| BREACHED | #EF4444 (Red) |

---

*TicketIQ © 2026 — Software Engineering Subject Project*
