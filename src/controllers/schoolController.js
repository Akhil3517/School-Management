const { validationResult } = require('express-validator');
const pool = require('../config/database');

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Format validation errors into user-friendly messages
const formatValidationErrors = (errors) => {
  return errors.map(error => {
    switch(error.param) {
      case 'name':
        return 'Please enter a valid school name (2-100 characters)';
      case 'address':
        return 'Please enter a valid address (5-200 characters)';
      case 'latitude':
        return 'Please enter a valid latitude (-90 to 90)';
      case 'longitude':
        return 'Please enter a valid longitude (-180 to 180)';
      default:
        return error.msg;
    }
  });
};

exports.addSchool = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please correct the following errors:',
        errors: formatValidationErrors(errors.array())
      });
    }

    const { name, address, latitude, longitude } = req.body;
    
    // Check if school with same name already exists
    const [existingSchools] = await pool.execute(
      'SELECT id FROM schools WHERE name = ?',
      [name]
    );

    if (existingSchools.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A school with this name already exists'
      });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );

    res.status(201).json({
      success: true,
      message: 'School added successfully',
      data: {
        id: result.insertId,
        name,
        address,
        latitude,
        longitude
      }
    });
  } catch (error) {
    console.error('Error adding school:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to add school. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.listSchools = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide valid coordinates',
        errors: formatValidationErrors(errors.array())
      });
    }

    const { latitude, longitude } = req.query;
    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    const [schools] = await pool.execute('SELECT * FROM schools');

    if (schools.length === 0) {
      return res.json({
        success: true,
        message: 'No schools found in the database',
        data: []
      });
    }

    // Calculate distance and sort schools
    const schoolsWithDistance = schools.map(school => ({
      ...school,
      distance: calculateDistance(
        userLat,
        userLon,
        school.latitude,
        school.longitude
      )
    }));

    schoolsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      message: `Found ${schoolsWithDistance.length} schools`,
      data: schoolsWithDistance
    });
  } catch (error) {
    console.error('Error listing schools:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch schools. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 