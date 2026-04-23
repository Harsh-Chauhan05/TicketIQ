# TicketIQ — 11. Environment & DevOps

> **Domain-Adaptive Customer Support Ticket Prioritization and SLA Monitoring System**

| Property | Value |
|---|---|
| Document ID | 11-environment-and-devops |
| Version | 1.0.0 |
| Environments | Development, Production |
| Date | March 2026 |

---

## 1. Environment Overview

| Environment | Frontend | Backend | Database |
|---|---|---|---|
| Development | `localhost:5173` (Vite) | `localhost:5000` (nodemon) | MongoDB Atlas (dev cluster) |
| Production | Vercel (static build) | Render (web service) | MongoDB Atlas (prod cluster) |

---

## 2. Development Environment Setup

### 2.1 Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 18.x+ | JavaScript runtime |
| npm | 9.x+ | Package manager |
| Git | Latest | Version control |
| MongoDB Atlas | Free M0 | Cloud database |
| VS Code | Latest | Code editor (recommended) |
| Postman | Latest | API testing |

### 2.2 Initial Setup

```bash
# Clone repository
git clone https://github.com/yourname/ticketiq.git
cd ticketiq

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install

# Configure environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit .env files with your MongoDB URI and JWT secret
```

### 2.3 Running Locally

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev

# OR use root concurrent command
npm run dev
```

### 2.4 Seed Default Data

```bash
cd server
npm run seed
# Seeds: 4 domain rule sets + 16 SLA policies (4 priorities × 4 domains)
```

---

## 3. Environment Variables

### 3.1 Backend — `server/.env`

```env
# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ticketiq

# Authentication
JWT_SECRET=your_super_secret_key_minimum_32_chars
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:5173
```

### 3.2 Frontend — `client/.env`

```env
VITE_API_URL=http://localhost:5000
```

### 3.3 Production Variables

| Variable | Dev Value | Prod Value |
|---|---|---|
| `MONGO_URI` | Atlas dev cluster | Atlas prod cluster |
| `JWT_SECRET` | Dev secret | Strong random secret |
| `JWT_EXPIRE` | `7d` | `7d` |
| `PORT` | `5000` | `5000` (Render assigns) |
| `NODE_ENV` | `development` | `production` |
| `CLIENT_URL` | `http://localhost:5173` | `https://ticketiq.vercel.app` |
| `VITE_API_URL` | `http://localhost:5000` | `https://ticketiq-api.render.com` |

### 3.4 Security Rules

- ❌ **Never** commit `.env` to Git
- ❌ **Never** hardcode secrets in source code
- ✅ Use `.env.example` as a template (committed, no real values)
- ✅ Set production variables via platform dashboards (Vercel/Render)

---

## 4. Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                  PRODUCTION SETUP                    │
│                                                     │
│  ┌──────────────┐          ┌──────────────────┐    │
│  │   Vercel      │  HTTPS   │     Render        │    │
│  │   React SPA   │────────▶│  Node.js/Express  │    │
│  │   (Static)    │          │  (Web Service)    │    │
│  └──────────────┘          └────────┬─────────┘    │
│                                     │               │
│                                     │ Mongoose      │
│                                     ▼               │
│                          ┌──────────────────┐       │
│                          │  MongoDB Atlas    │       │
│                          │  (Free M0 Tier)   │       │
│                          └──────────────────┘       │
└─────────────────────────────────────────────────────┘
```

---

## 5. Frontend Deployment — Vercel

### 5.1 Setup

1. Push code to GitHub repository
2. Connect GitHub repo to Vercel
3. Configure build settings:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `client` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 5.2 Environment Variables on Vercel

```
VITE_API_URL = https://ticketiq-api.render.com
```

### 5.3 Auto-Deploy

- Vercel auto-deploys on every push to `main` branch
- Preview deployments for pull requests

---

## 6. Backend Deployment — Render

### 6.1 Setup

1. Create a **Web Service** on Render
2. Connect GitHub repository
3. Configure:

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Plan | Free |

### 6.2 Environment Variables on Render

```
MONGO_URI    = mongodb+srv://...
JWT_SECRET   = <strong_random_secret>
JWT_EXPIRE   = 7d
CLIENT_URL   = https://ticketiq.vercel.app
NODE_ENV     = production
PORT         = 5000
```

### 6.3 Free Tier Considerations

| Behavior | Detail |
|---|---|
| Sleep after inactivity | Server sleeps after 15 min of no requests |
| Cold start | First request after sleep takes ~30 seconds |
| Mitigation | Show loading indicator on frontend |
| Cron job behavior | Cron runs only while server is awake |

---

## 7. Database — MongoDB Atlas

### 7.1 Setup

1. Create free M0 cluster on MongoDB Atlas
2. Create database user with readWrite access
3. Whitelist IPs: `0.0.0.0/0` (allow all — required for Render)
4. Get connection string for `server/.env`

### 7.2 Free Tier Limits

| Limit | Value |
|---|---|
| Storage | 512 MB |
| Connections | 500 concurrent |
| RAM | Shared |
| Backup | Daily automated |

### 7.3 Collections

```
ticketiq (database)
├── users
├── tickets
├── domains
├── slapolicies
└── notifications
```

---

## 8. CORS Configuration

### Development

```js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Production

```js
app.use(cors({
  origin: process.env.CLIENT_URL,  // Vercel URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 9. Cookie Configuration

```js
// Development
res.cookie('token', token, {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});

// Production
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

---

## 10. Version Control — Git & GitHub

### 10.1 Repository Structure

```
main branch (production-ready code)
├── Protected — deploy triggers from here
└── All features merged via PRs (recommended)
```

### 10.2 `.gitignore`

```gitignore
node_modules/
dist/
build/
.env
.env.local
.env.production
*.log
.DS_Store
Thumbs.db
.vscode/
```

### 10.3 Commit Convention (Recommended)

```
feat: add priority engine service
fix: resolve SLA cron job timing issue
style: update ticket queue layout
docs: add API documentation
refactor: extract SLA calculation into utility
test: add priority engine unit tests
```

---

## 11. Monitoring & Logging

### 11.1 Backend Logging

```js
// Console logging pattern
console.log(`[Server] Running on port ${PORT}`);
console.log(`[MongoDB] Connected to ${MONGO_URI}`);
console.log(`[SLA Monitor] ${count} breach(es) detected at ${new Date().toISOString()}`);
console.error(`[SLA Monitor] Error: ${err.message}`);
```

### 11.2 Error Tracking

| Aspect | MVP Approach |
|---|---|
| Server errors | Console logs (visible in Render dashboard) |
| API errors | Structured JSON error responses |
| Frontend errors | Console + inline error messages |
| Monitoring | Manual via Render + MongoDB Atlas dashboards |

---

*TicketIQ © 2026 — Software Engineering Subject Project*
