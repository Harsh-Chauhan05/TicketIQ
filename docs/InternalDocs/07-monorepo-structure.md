# TicketIQ — 07. Monorepo Structure

> **Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document ID | 07-monorepo-structure |
| Version | 1.0.0 |
| Structure Type | Monorepo (client + server) |
| Date | March 2026 |

---

## 1. Project Root

```
ticketiq/
├── client/                  # React Frontend
├── server/                  # Node.js Backend
├── .gitignore
├── README.md
└── package.json             # Root scripts for concurrent dev
```

---

## 2. Backend — `server/`

```
server/
├── config/
│   └── db.js                # MongoDB connection (mongoose.connect)
├── controllers/
│   ├── authController.js    # Register, Login, GetMe
│   ├── ticketController.js  # CRUD + priority engine integration
│   ├── domainController.js  # Domain rules CRUD
│   ├── slaController.js     # SLA policy CRUD + reports
│   ├── userController.js    # User management (admin)
│   └── notificationController.js
├── middleware/
│   ├── authMiddleware.js    # JWT verification, user loading
│   └── roleMiddleware.js    # Role-based access guard
├── models/
│   ├── User.js              # User schema + bcrypt hooks
│   ├── Ticket.js            # Ticket schema + indexes
│   ├── Domain.js            # Domain rules schema
│   ├── SLAPolicy.js         # SLA policy schema
│   └── Notification.js      # Notification schema
├── routes/
│   ├── authRoutes.js
│   ├── ticketRoutes.js
│   ├── domainRoutes.js
│   ├── slaRoutes.js
│   ├── userRoutes.js
│   └── notificationRoutes.js
├── services/
│   ├── priorityEngine.js    # Domain rules matching engine
│   └── slaMonitor.js        # Cron job (every 60s)
├── utils/
│   └── apiResponse.js       # Standardized response helper
├── seeds/
│   └── seedData.js          # Default domain rules + SLA policies
├── .env                     # Environment variables (NOT committed)
├── .env.example             # Template (committed)
├── package.json
└── server.js                # Entry point
```

### Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "node-cron": "^3.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express-validator": "^7.0.0",
    "cookie-parser": "^1.4.6",
    "express-rate-limit": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

---

## 3. Frontend — `client/`

```
client/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                 # Axios API call modules
│   │   ├── axiosInstance.js  # Configured axios + interceptors
│   │   ├── auth.js
│   │   ├── tickets.js
│   │   ├── domains.js
│   │   ├── sla.js
│   │   ├── users.js
│   │   └── notifications.js
│   ├── components/          # Reusable UI Components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── PriorityBadge.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── SLARingTimer.jsx
│   │   ├── StatsCard.jsx
│   │   ├── TicketRow.jsx
│   │   ├── ConfirmDialog.jsx
│   │   └── LoadingSpinner.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   ├── pages/
│   │   ├── auth/            # Login, Register, ForgotPassword
│   │   ├── customer/        # Dashboard, SubmitTicket, TicketDetail, TicketHistory, Profile
│   │   ├── agent/           # Dashboard, TicketQueue, TicketDetail, SLAMonitor, Notifications, Profile
│   │   └── admin/           # Dashboard, ManageTickets, DomainConfig, SLASettings, UserManagement, SLAReports, Notifications, TenantSettings
│   ├── routes/
│   │   ├── PrivateRoute.jsx
│   │   └── RoleRoute.jsx
│   ├── utils/
│   │   ├── priorityColors.js
│   │   └── slaHelpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── package.json
└── index.html
```

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.0.0",
    "recharts": "^2.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}
```

---

## 4. Development Commands

| Command | Location | Description |
|---|---|---|
| `npm run dev` | `/server` | Backend with nodemon (port 5000) |
| `npm run dev` | `/client` | Frontend with Vite (port 5173) |
| `npm run dev` | Root | Both concurrent |
| `npm run build` | `/client` | Production build |
| `npm run seed` | `/server` | Seed default data |

## 5. Environment Variables

### `server/.env`
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ticketiq
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

### `client/.env`
```env
VITE_API_URL=http://localhost:5000
```

---

*TicketIQ © 2026 — Software Engineering Subject Project*
