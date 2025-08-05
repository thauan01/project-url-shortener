<h3> URL Shortener App </h3>

## Description

This application is a powerful URL shortener. In just a few steps, you can create multiple short URLs that redirect to the original URLs. Each short URL is identified and unique in our database. You can also list all URLs created by you (your user), view access count for each URL, and manage the user database.

## Project setup

### 1. Clone the repository

```bash
$ git clone https://github.com/thauan01/project-url-shortener.git
$ cd project-url-shortener/url_shortener
```

### 2. Start the database with Docker Compose

```bash
$ docker-compose up -d
```

### 3. Install dependencies

```bash
$ npm install
```

## Compile and run the project

```bash
$ npm run start
```

## Deployment

### System Requirements

This application was built originally for Node.js version 22.18.0, which is the LTS version as of the development date: 08/05/2025.

**Required Software:**
- Node.js v22.18.0 or higher
- npm or yarn package manager
- Docker and Docker Compose (for database)
- PostgreSQL 15 (managed via Docker)

### Environment Configuration

Before deploying, ensure you have the proper environment variables configured:

1. Create a `.env` file in the root directory with the following variables:
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=url-shortener-user
DB_PASSWORD=url-shortener-password
DB_NAME=url-shortener-database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=3600s

# Application Configuration
PORT=3000
NODE_ENV=production
BASE_URL=http://localhost:3000
```

### Production Build

To build the application for production:

```bash
# Install dependencies
$ npm ci --only=production

# Build the application
$ npm run build

# Start in production mode
$ npm run start:prod
```

### Database Setup

The application uses PostgreSQL as the database. Make sure the database service is running:

```bash
# Start the database container
$ docker-compose up -d postgres

# Verify the database is running
$ docker ps
```

## How to use
If everything is set up correctly, after the application is running, use Swagger to access the endpoints. Here in this README, we descript to you the main endopoints. We have the folder '/docs' for usage and examples for all endpoints

### Main Endpoints

### 1. Shorten URL (Public)
**POST** `/shorten`

Creates a shortened version of a provided URL. This endpoint is public, but if the user is authenticated, the URL will be associated with their account.

**Features:**
- ✅ Public (no authentication required)
- 🔒 Optional authentication (if JWT token provided, associates with user)
- 📊 Support for anonymous users

**Request Body:**
```json
{
  "originalUrl": "https://www.example.com/very-long-page-with-parameters?param1=value1&param2=value2"
}
```

**Response (201 Created):**
```json
{
  "id": "url-uuid",
  "originalUrl": "https://www.example.com/very-long-page-with-parameters?param1=value1&param2=value2",
  "shortCode": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "userId": "user-uuid",
  "createdAt": "2025-08-04T10:30:00Z",
  "clickCount": 0
}
```

**Usage examples:**

**Anonymous user:**
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://www.google.com"
  }'
```

**Authenticated user:**
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "originalUrl": "https://www.google.com"
  }'
```

### 2. View Your URLs (Authenticated)
**GET** `/my-urls`

Lists all URLs created by the authenticated user.

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "id": "url-uuid",
    "originalUrl": "https://www.example.com",
    "shortCode": "abc123",
    "shortUrl": "http://localhost:3000/abc123",
    "userId": "user-uuid",
    "createdAt": "2025-08-04T10:30:00Z",
    "clickCount": 5
  }
]
```

**Usage example:**
```bash
curl -X GET http://localhost:3000/my-urls \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Create New User
**POST** `/users`

Creates a new user in the system.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "New User Name",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "id": "new-user-uuid",
  "email": "newuser@example.com",
  "name": "New User Name"
}
```

**Usage example:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "New User Name",
    "password": "password123"
  }'
```

### 4. User Login
**POST** `/users/login`

Authenticates a user and returns a JWT token for accessing protected resources.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Usage example:**
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```


### Security Considerations

- Always use strong JWT secrets
- Configure CORS properly for your domain
- Use HTTPS in production environments
- Regularly update dependencies to patch security vulnerabilities
- Consider rate limiting for API endpoints

### Performance Optimization

- Use `npm run start:prod` for optimized production builds
- Consider implementing Redis for caching frequent URL lookups
- Monitor database performance and add indexes as needed
- Use a reverse proxy (nginx) for load balancing if needed

### Monitoring and Maintenance

- Implement logging for production debugging
- Set up health checks for the application and database
- Monitor memory usage and performance metrics
- Regular database backups are recommended

