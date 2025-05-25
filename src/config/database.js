const mysql = require('mysql2/promise');
require('dotenv').config();

// Debug: Log environment variables (without password)
console.log('Database Configuration:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  // Log if SSL is enabled
  ssl: process.env.DB_SSL === 'true'
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    // Required for cloud databases
    rejectUnauthorized: true
  },
  // Add these options for better connection handling
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 10000,
  dateStrings: true
});

// Test the connection with retry logic
const testConnection = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('Database connected successfully');
      connection.release();
      return;
    } catch (err) {
      console.error(`Database connection attempt ${i + 1} failed:`, {
        message: err.message,
        code: err.code,
        errno: err.errno,
        sqlState: err.sqlState,
        sqlMessage: err.sqlMessage
      });
      
      if (i < retries - 1) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('Failed to connect to database after all retries');
        // Log detailed connection information for debugging
        console.error('Connection details:', {
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          database: process.env.DB_NAME,
          ssl: process.env.DB_SSL === 'true'
        });
      }
    }
  }
};

// Test connection on startup
testConnection();

module.exports = pool; 