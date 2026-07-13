
console.log("Loaded:", !!process.env.MONGO_URI);

 mongoose = require('mongoose');

/**
 * Establishes the Mongoose connection to MongoDB.
 * Fails fast (process.exit) if the connection cannot be established,
 * since the API is unusable without a database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern Mongoose (6+/7+/8+) no longer needs useNewUrlParser / useUnifiedTopology,
      // they are kept here as no-ops for clarity/compatibility with older drivers.
    });

    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected.');
    });
  } catch (err) {
    console.error(`[MongoDB] Initial connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
