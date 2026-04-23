const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Retry instead of crashing
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Event listeners for connection state
mongoose.connection.on('disconnected', () => {
  console.warn('⚠  MongoDB disconnected — will auto-reconnect via Mongoose driver');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

module.exports = connectDB;
