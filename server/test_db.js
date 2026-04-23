require('dotenv').config();
const mongoose = require('mongoose');

const checkConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Connection Test Successful');
        process.exit(0);
    } catch (e) {
        console.error('❌ Connection Failed:', e.message);
        process.exit(1);
    }
}
checkConnection();
