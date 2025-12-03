# Invoice Tracker Backend

Express.js REST API with Passport.js authentication using local strategy and JWT cookie-based auth.

## Features

- **Express.js** - Web framework for Node.js
- **Passport.js** - Authentication middleware with local strategy
- **JWT** - JSON Web Tokens for secure authentication
- **Cookie-based** - Tokens stored in HTTP-only cookies
- **bcryptjs** - Password hashing
- **CORS** - Cross-Origin Resource Sharing enabled

## Project Structure

```
src/
├── config/
│   ├── constants.js      # Configuration constants
│   └── passport.js       # Passport local strategy setup
├── controllers/
│   └── authController.js # Authentication logic
├── middleware/
│   ├── auth.js          # JWT verification middleware
│   └── localAuth.js     # Local strategy middleware
├── models/
│   └── User.js          # User model
├── routes/
│   └── auth.js          # Authentication routes
└── index.js             # Express app entry point
```

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
COOKIE_EXPIRE=604800000
CORS_ORIGIN=http://localhost:3000
```

## Running the Server

### Development (with nodemon)
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```

- **POST** `/api/auth/login` - Login user (local strategy)
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **POST** `/api/auth/logout` - Logout user (protected)

- **GET** `/api/auth/me` - Get current user (protected)

- **GET** `/health` - Server health check

## Middleware

### `authMiddleware`
Verifies JWT token from cookies. Required for protected routes.

### `localAuthMiddleware`
Validates email and password using Passport local strategy.

## How It Works

1. User registers or logs in with email/password
2. Password is validated against bcrypt hash
3. JWT token is generated and stored in an HTTP-only cookie
4. Token is verified on protected routes via `authMiddleware`
5. User can logout to clear the cookie

## Security Features

- HTTP-only cookies prevent XSS attacks
- Secure flag for HTTPS in production
- SameSite strict for CSRF protection
- Password hashing with bcryptjs
- JWT expiration
- CORS enabled

## License

ISC
