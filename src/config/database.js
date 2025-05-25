const mysql = require('mysql2/promise');
require('dotenv').config();

// Debug: Log environment variables (without password)
console.log('Database Configuration:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
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
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : undefined,
  // Add connection timeout
  connectTimeout: 60000, // 60 seconds
  // Add debug mode
  debug: true,
  // Add DNS lookup options
  dns: {
    lookup: (hostname, options, callback) => {
      console.log('DNS lookup for:', hostname);
      // Try to resolve the hostname to IP
      require('dns').lookup(hostname, { all: true }, (err, addresses) => {
        if (err) {
          console.error('DNS lookup error:', err);
          callback(err);
        } else {
          // Use the first IP address found
          const ip = addresses[0].address;
          console.log('Using IP address:', ip);
          callback(null, ip, addresses[0].family);
        }
      });
    }
  }
});

// Test the connection with retry logic
const testConnection = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting database connection (attempt ${i + 1}/${retries})...`);
      console.log('Trying to connect to:', process.env.DB_HOST);
      
      const connection = await pool.getConnection();
      console.log('Database connected successfully');
      
      // Test if we can query the database
      const [rows] = await connection.query('SELECT 1');
      console.log('Database query test successful');
      
      // Test if we can access the schools table
      try {
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Available tables:', tables);
      } catch (tableError) {
        console.error('Error checking tables:', tableError);
      }
      
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
        
        // Additional debugging information
        console.error('Please verify:');
        console.error('1. Database hostname is correct');
        console.error('2. Database username and password are correct');
        console.error('3. Database name is correct');
        console.error('4. Your IP is allowed in database access settings');
        console.error('5. Database server is running and accessible');
        
        // Try to resolve the hostname
        try {
          const dns = require('dns');
          dns.lookup(process.env.DB_HOST, { all: true }, (err, addresses) => {
            if (err) {
              console.error('DNS lookup failed:', err);
            } else {
              console.log('Available IP addresses:', addresses);
            }
          });
        } catch (dnsError) {
          console.error('DNS lookup error:', dnsError);
        }
      }
    }
  }
};

// Test connection on startup
testConnection();

module.exports = pool; 