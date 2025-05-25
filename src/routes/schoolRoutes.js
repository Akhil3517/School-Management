const express = require('express');
const router = express.Router();
const {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool
} = require('../controllers/schoolController');

// Log all requests
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Create a new school
router.post('/schools', createSchool);

// Get all schools
router.get('/schools', getAllSchools);

// Get school by ID
router.get('/schools/:id', getSchoolById);

// Update school
router.put('/schools/:id', updateSchool);

// Delete school
router.delete('/schools/:id', deleteSchool);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

module.exports = router; 