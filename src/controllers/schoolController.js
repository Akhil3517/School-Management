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

// Create a new school
const createSchool = async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Input validation
  if (!name || !address || latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: {
        name: !name ? 'Name is required' : null,
        address: !address ? 'Address is required' : null,
        latitude: latitude === undefined ? 'Latitude is required' : null,
        longitude: longitude === undefined ? 'Longitude is required' : null
      }
    });
  }

  try {
    // Log the incoming request
    console.log('Creating school:', { name, address, latitude, longitude });

    const [result] = await pool.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );

    console.log('School created successfully:', result);

    res.status(201).json({
      message: 'School created successfully',
      schoolId: result.insertId
    });
  } catch (error) {
    console.error('Error creating school:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });

    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'School with this name already exists'
      });
    }

    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        error: 'Database table does not exist',
        details: 'Please contact the administrator'
      });
    }

    res.status(500).json({
      error: 'Failed to create school',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all schools with proximity sorting
const getAllSchools = async (req, res) => {
  const { latitude, longitude } = req.query;

  try {
    console.log('Fetching all schools');
    const [schools] = await pool.query('SELECT * FROM schools');
    console.log(`Found ${schools.length} schools`);

    // If latitude and longitude are provided, sort by proximity
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);

      // Validate coordinates
      if (isNaN(userLat) || isNaN(userLon) || 
          userLat < -90 || userLat > 90 || 
          userLon < -180 || userLon > 180) {
        return res.status(400).json({
          error: 'Invalid coordinates',
          details: 'Latitude must be between -90 and 90, longitude between -180 and 180'
        });
      }

      // Calculate distance for each school and add it to the response
      const schoolsWithDistance = schools.map(school => ({
        ...school,
        distance: calculateDistance(
          userLat,
          userLon,
          school.latitude,
          school.longitude
        )
      }));

      // Sort schools by distance
      schoolsWithDistance.sort((a, b) => a.distance - b.distance);

      return res.json(schoolsWithDistance);
    }

    // If no coordinates provided, return unsorted list
    res.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({
      error: 'Failed to fetch schools',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get school by ID
const getSchoolById = async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`Fetching school with ID: ${id}`);
    const [schools] = await pool.query('SELECT * FROM schools WHERE id = ?', [id]);

    if (schools.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(schools[0]);
  } catch (error) {
    console.error(`Error fetching school ${id}:`, error);
    res.status(500).json({
      error: 'Failed to fetch school',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update school
const updateSchool = async (req, res) => {
  const { id } = req.params;
  const { name, address, latitude, longitude } = req.body;

  try {
    console.log(`Updating school ${id}:`, { name, address, latitude, longitude });
    const [result] = await pool.query(
      'UPDATE schools SET name = ?, address = ?, latitude = ?, longitude = ? WHERE id = ?',
      [name, address, latitude, longitude, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json({ message: 'School updated successfully' });
  } catch (error) {
    console.error(`Error updating school ${id}:`, error);
    res.status(500).json({
      error: 'Failed to update school',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete school
const deleteSchool = async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`Deleting school ${id}`);
    const [result] = await pool.query('DELETE FROM schools WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error(`Error deleting school ${id}:`, error);
    res.status(500).json({
      error: 'Failed to delete school',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool
}; 