const pool = require('./database');

const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Drop existing table if needed (uncomment if you want to reset the table)
    // await pool.execute('DROP TABLE IF EXISTS schools');
    
    // Create schools table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS schools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        latitude FLOAT NOT NULL,
        longitude FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Verify table structure
    const [tables] = await pool.execute('SHOW TABLES');
    console.log('Available tables:', tables);

    const [columns] = await pool.execute('DESCRIBE schools');
    console.log('Schools table structure:', columns);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  } finally {
    // Close the pool
    await pool.end();
    process.exit();
  }
};

// Run initialization
initializeDatabase(); 