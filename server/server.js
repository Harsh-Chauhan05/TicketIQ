require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { startSLAMonitor } = require('./services/slaMonitor');

// Route imports
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const domainRoutes = require('./routes/domainRoutes');
const slaRoutes = require('./routes/slaRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting — only on login/register to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests — please try again later' },
  skip: (req) => req.method === 'GET', // Never rate-limit GET (getMe)
});

// ── Routes ──────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/sla', slaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'TicketIQ API is running 🚀', env: process.env.NODE_ENV });
});

// ── 404 handler ─────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start Server ─────────────────────────────────────────
const http = require('http');
const socketUtil = require('./utils/socket');
const server = http.createServer(app);

// Initialize Socket.io
socketUtil.init(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 TicketIQ Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);

  // Start SLA breach detection cron job
  startSLAMonitor();
});

module.exports = app;
