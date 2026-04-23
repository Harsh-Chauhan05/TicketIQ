# ⚡ TicketIQ: AI-Powered Support & SLA Command Center

![TicketIQ Banner](https://raw.githubusercontent.com/Harsh-Chauhan05/TicketIQ/main/client/src/assets/hero.png)

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**TicketIQ** is a state-of-the-art, domain-adaptive customer support platform. It leverages a proprietary AI Priority Engine to automatically categorize, score, and monitor support tickets across multiple industry domains (Banking, E-commerce, Healthcare, etc.).

---

## ✨ Key Features

### 🧠 1. AI Priority Engine
Automatically assigns priority (Critical, High, Medium, Low) based on sentiment and keyword analysis specific to your business domain.

### ⏱️ 2. Real-Time SLA Monitoring
Dynamic resolution timers that track every second. Tickets are visually flagged as **"At Risk"** or **"Breached"** to ensure zero missed deadlines.

### 📊 3. High-End Admin Analytics
A data-driven dashboard featuring Neon-themed Recharts. Track ticket trends, distribution, and agent performance in real-time.

### ☁️ 4. Enterprise Infrastructure
- **Cloudinary**: Secure cloud storage for attachments.
- **Brevo API**: Bulletproof transactional emails via HTTP API (Port 443).
- **Socket.io**: Instant, live queue updates.

---

## 🏗️ Architecture

```mermaid
graph TD
    Client[React Frontend] -->|REST API| Server[Node/Express Backend]
    Server -->|Mongoose| DB[(MongoDB Atlas)]
    Server -->|Socket.io| Client
    Server -->|HTTP API| Brevo[Brevo Email Service]
    Server -->|Uploads| Cloudinary[Cloudinary CDN]
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Cloudinary & Brevo Accounts

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/Harsh-Chauhan05/TicketIQ.git

# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 3. Environment Setup
Create a `.env` file in the **server** directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
BREVO_SMTP_KEY=xkeysib-...
BREVO_SENDER_EMAIL=...
BREVO_SENDER_NAME=...
CLIENT_URL=http://localhost:5173
```

---

## 🛠️ Tech Stack
- **Frontend**: React, Tailwind CSS, Framer Motion, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, Socket.io, JWT, Nodemailer (REST fallback).
- **Database**: MongoDB (Multi-tenant schema).

---

## 🤝 Connect with Me
- **LinkedIn**: [Harsh Chauhan](https://www.linkedin.com/in/harshchauhan-it)
- **GitHub**: [@Harsh-Chauhan05](https://github.com/Harsh-Chauhan05)

---
*Created with ❤️ by Harsh Chauhan*
