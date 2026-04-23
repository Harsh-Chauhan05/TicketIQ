# 🎫 TicketIQ - Comprehensive Testing Guide

Welcome to the full-stack testing environment of **TicketIQ**. This guide outlines the key features and workflows for each role to help you verify the integration.

---

## 🔐 1. Authentication & Role Access
Before testing, you need users with different roles. Use the registration page to create them.

| Role | Access Level | Starting URL |
| :--- | :--- | :--- |
| **Customer** | Submit and track own tickets | `/customer/dashboard` |
| **Agent** | Manage assigned tickets & SLA queue | `/agent/dashboard` |
| **Admin** | Full system control & configuration | `/admin/dashboard` |

> [!TIP]
> **To test different roles:** Use an incognito window or log out and log in with a user of the specific role. You can change a user's role directly in MongoDB if needed.

---

## 👤 2. Customer Workflow (User Experience)
*Verify the journey from issue reporting to resolution.*

1. **Submit Ticket (`/customer/submit`)**:
   - Fill in a **Subject** and **Description**. 
   - **AI Test:** Try using urgent words like "broken", "critical", or "immediate" in the description.
   - Select a **Requested Priority**.
   - **Verification:** Click submit. You should be redirected to the Ticket Detail page.

2. **Ticket History (`/customer/dashboard`)**:
   - Check the KPI cards (Total, Open, Resolved).
   - Verify your new ticket appears in the list with the correct status.

3. **Communication (`/customer/tickets/:id`)**:
   - Send a reply to the agent.
   - Verify your message appears in the "Activity" thread.

---

## 🛠️ 3. Agent Workflow (Productivity)
*Verify the AI-powered prioritization and SLA monitoring.*

1. **Agent Workspace (`/agent/dashboard`)**:
   - View top-priority tickets sorted by the **AI Priority Engine**.
   - Check **SLA Breached** and **Critical Priority** counters.

2. **Priority Queue (`/agent/queue`)**:
   - Use filters (Open, Critical, All) to sort the queue.
   - Verify the **SLA Status** shows real-time countdowns.

3. **Ticket Handling (`/agent/tickets/:id`)**:
   - **Internal Notes:** Post a private note (Amber background). Verify customers cannot see these.
   - **Public Reply:** Reply to the customer (Purple background).
   - **Status Update:** Change the status (e.g., to "In Progress").
   - **Admin Override:** If an admin, test overriding the priority (requires a reason).
   - **Assignment:** Click "Assign to me" to take ownership of an unassigned ticket.

---

## 👑 4. Admin Workflow (Command Center)
*Verify global management and system configuration.*

1. **User Management (`/admin/users`)**:
   - View all registered users.
   - Toggle account status (Active/Inactive).
   - *Future Feature:* Change roles directly from UI.

2. **Domain Configuration (`/admin/domain-config`)**:
   - View existing AI Priority rules for different business domains (Banking, Ecommerce, etc.).
   - Verify keyword mappings (e.g., "urgent" -> Upgrade).

3. **SLA Settings (`/admin/sla-settings`)**:
   - View response and resolution time targets for each priority level.

4. **Global Ticket Oversight (`/admin/tickets`)**:
   - Monitor every ticket in the system regardless of assignment.

---

## 🧠 5. Key System Features to Validate

### 🚀 AI Priority Engine
- **How to test:** Create a ticket as a **Customer** with `Low` priority but use the word **"URGENT"** in the description.
- **Result:** Log in as an **Agent** and check if the ticket was automatically upgraded based on domain rules.

### ⏱️ SLA Monitor
- **How to test:** Look at the `SLA Status` column in the Agent Queue.
- **Result:** Tickets with higher priority should have shorter deadlines. Check if "Breached" status appears for past-due tickets.

### 🎨 Design & Aesthetic
- Verify the **"Kinetic Oracle"** theme (Glassmorphism, Neon highlights, Dark Mode) is consistent across all pages.
- Check responsiveness by resizing the browser.

---

**Found a bug?** Note down the URL and the Console Error (F12) to help us squash it!
