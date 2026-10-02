// ============================================================
//  CampusGPT — MongoDB Atlas Connection
// ============================================================

const mongoose = require('mongoose');

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not set in environment.');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    }).then((conn) => {
      console.log(`  ✅  MongoDB connected: ${conn.connection.host}`);
      return conn.connection;
    }).catch((err) => {
      connectionPromise = null;
      throw err;
    });
  }

  return connectionPromise;
};

module.exports = connectDB;
