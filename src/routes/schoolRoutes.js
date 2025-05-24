const express = require('express');
const { body, query, validationResult } = require('express-validator');
const schoolController = require('../controllers/schoolController');

const router = express.Router();

// Add School Route
router.post('/addSchool',
  [
    body('name').notEmpty().trim().withMessage('School name is required'),
    body('address').notEmpty().trim().withMessage('Address is required'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required')
  ],
  schoolController.addSchool
);

// List Schools Route
router.get('/listSchools',
  [
    query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required')
  ],
  schoolController.listSchools
);

module.exports = router; 