const mysql = require('mysql2/promise');
require('dotenv').config();
const user = process.env.MYSQLUSER || process.env.MYSQLUSERNAME || process.env.DB_USER;

console.log('Database Configuration:', {
  host: process.env.MYSQLHOST || process.env.DB_HOST,
  user: user,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  port: process.env.MYSQLPORT || process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true'
});

const requiredEnvVars = ['MYSQLHOST', 'MYSQLPASSWORD', 'MYSQLDATABASE', 'MYSQLPORT'];
const hasUser = process.env.MYSQLUSER || process.env.MYSQLUSERNAME;
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (!hasUser) missingEnvVars.push('MYSQLUSER or MYSQLUSERNAME');

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  console.error('Please make sure you have added a MySQL database to your Railway project');
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST,
  user: user,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  port: process.env.MYSQLPORT || process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : undefined
});
const testConnection = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting database connection (attempt ${i + 1}/${retries})...`);
      console.log('Trying to connect to:', process.env.MYSQLHOST || process.env.DB_HOST);
      
      const connection = await pool.getConnection();
      console.log('Database connected successfully');
      const [rows] = await connection.query('SELECT 1');
      console.log('Database query test successful');
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
        console.error('Please verify:');
        console.error('1. Database is created in Render');
        console.error('2. Environment variables are set correctly');
        console.error('3. Database is linked to your service');
        process.exit(1);
      }
    }
  }
};
testConnection();

module.exports = pool; 