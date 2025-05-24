# School Management API

A Node.js API for managing schools with location-based sorting functionality.

## Features

- Add new schools with location data
- List schools sorted by proximity to a given location
- Input validation
- Error handling
- MySQL database integration
- Web interface for easy interaction

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## Local Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=school_management
   PORT=3000
   NODE_ENV=development
   ```

4. Set up the database:
   - Run the SQL commands in `src/config/schema.sql` to create the database and tables

5. Start the server:
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Add School
- **POST** `/api/addSchool`
- **Body:**
  ```json
  {
    "name": "School Name",
    "address": "School Address",
    "latitude": 12.9716,
    "longitude": 77.5946
  }
  ```

### List Schools
- **GET** `/api/listSchools?latitude=12.9716&longitude=77.5946`
- **Query Parameters:**
  - `latitude`: User's latitude
  - `longitude`: User's longitude

## Testing

### Using Postman

1. Import the Postman collection:
   - Open Postman
   - Click "Import"
   - Select the `school-management-api.postman_collection.json` file

2. Test the endpoints:
   - Add School: Send a POST request with school details
   - List Schools: Send a GET request with coordinates

### Using the Web Interface

1. Open `http://localhost:3000` in your browser
2. Use the form to add new schools
3. View the list of schools sorted by proximity

## Deployment

### Deploying to Render.com

1. Create a Render account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - Name: `school-management-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables:
   ```
   DB_HOST=your-mysql-host
   DB_USER=your-mysql-user
   DB_PASSWORD=your-mysql-password
   DB_NAME=school_management
   NODE_ENV=production
   ```

### Database Setup for Production

1. Create a MySQL database on your preferred hosting service
2. Run the schema.sql file to create the required tables
3. Update the environment variables with the production database credentials

## Error Handling

The API includes comprehensive error handling for:
- Invalid input data
- Database errors
- Server errors

All error responses follow the format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (in development mode)"
}
```

## Security

- Input validation using express-validator
- SQL injection prevention using parameterized queries
- CORS enabled
- Environment variable configuration
- Production error message sanitization 