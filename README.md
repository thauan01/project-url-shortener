<h3> URL Shortener App </h3>

## Description

This application is a greater URL shortener. In few steps, we can build many short URL's to redirect for original URL's. Each short location is identified and unique in our database. We can also list all URL's originated by you (your user), access count of acess number's for each location, and manage the user's database.

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

