# 📑 Software Requirements Specification (SRS)
## Project: TicketIQ Support System

### 1. Introduction
TicketIQ is an AI-driven support ticket management system designed to solve the problem of manual priority assignment and SLA mismanagement in growing organizations.

### 2. Functional Requirements
#### 2.1 User Management
- **Registration**: Secure sign-up with email verification.
- **Authentication**: JWT-based login with persistent sessions.
- **Roles**: Distinct permissions for Admin, Agent, and Customer roles.

#### 2.2 Ticket Lifecycle
- **Creation**: Customers submit tickets with titles, categories, and attachments.
- **AI Prioritization**: Tickets are automatically scored and assigned a priority (Critical, High, Medium, Low) based on domain-specific rules.
- **SLA Tracking**: Each priority level has a defined resolution window.
- **Comments/Collaboration**: Threaded discussion between customers and agents.
- **Resolution**: Agents mark tickets as resolved, stopping the SLA clock.

#### 2.3 Administrative Tools
- **Analytics**: Real-time charts showing system health and performance.
- **Domain Configuration**: Admin can update keywords and priority rules for the AI engine.
- **User Management**: Admin can deactivate users or change team roles.

### 3. Technical Requirements
- **Frontend**: React.js, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **File Storage**: Cloudinary (Cloud-based asset management).
- **Communication**: Socket.io (Real-time), Brevo API (Transactional Emails).

### 4. Non-Functional Requirements
- **Security**: Password hashing (bcrypt), Multi-tenant data isolation, and JWT protection.
- **Performance**: Sub-200ms API response times for critical paths.
- **Aesthetics**: Premium "Kinetic Oracle" design system with dark mode and neon highlights.

### 5. Deployment Architecture
- **Environment**: Containerized or cloud-hosted (Render/Vercel).
- **CI/CD**: Prepared for GitHub Actions integration.
- **Assets**: Decentralized storage via Cloudinary CDN.
