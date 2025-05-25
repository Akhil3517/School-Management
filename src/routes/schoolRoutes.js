const express = require('express');
const router = express.Router();
const {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool
} = require('../controllers/schoolController');
const pool = require('../config/database');

// Log all requests
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('SELECT 1');
    connection.release();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      environment: {
        host: process.env.MYSQLHOST,
        database: process.env.MYSQLDATABASE,
        port: process.env.MYSQLPORT
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      environment: {
        host: process.env.MYSQLHOST,
        database: process.env.MYSQLDATABASE,
        port: process.env.MYSQLPORT
      }
    });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Add School API
router.post('/addSchool', createSchool);

// List Schools API (with proximity sorting)
router.get('/listSchools', getAllSchools);

// Additional endpoints for completeness
router.get('/schools/:id', getSchoolById);
router.put('/schools/:id', updateSchool);
router.delete('/schools/:id', deleteSchool);

// Environment check endpoint
router.get('/env-check', (req, res) => {
  const env = {
    // Railway System Variables
    RAILWAY_PROJECT_NAME: process.env.RAILWAY_PROJECT_NAME,
    RAILWAY_ENVIRONMENT_NAME: process.env.RAILWAY_ENVIRONMENT_NAME,
    RAILWAY_SERVICE_NAME: process.env.RAILWAY_SERVICE_NAME,
    
    // Database Variables (without sensitive data)
    MYSQLHOST: process.env.MYSQLHOST,
    MYSQLDATABASE: process.env.MYSQLDATABASE,
    MYSQLPORT: process.env.MYSQLPORT,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT,
    
    // Other Variables
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT
  };
  
  res.json(env);
});

module.exports = router; 