const socketIO = require('socket.io');

let io;

const init = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New socket connection: ${socket.id}`);

    // Join room based on userId or tenantId for targeted notifications
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined their private room`);
    });

    socket.on('joinTenant', (tenantId) => {
      socket.join(`tenant_${tenantId}`);
      console.log(`🏢 Socket joined tenant room: tenant_${tenantId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Helper to emit events to specific users or tenants
const emitToUser = (userId, event, data) => {
  if (io) io.to(userId.toString()).emit(event, data);
};

const emitToTenant = (tenantId, event, data) => {
  if (io) io.to(`tenant_${tenantId.toString()}`).emit(event, data);
};

module.exports = { init, getIO, emitToUser, emitToTenant };
