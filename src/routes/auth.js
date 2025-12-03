const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const localAuthMiddleware = require('../middleware/localAuth');
const authenticationMiddleware = require('../middleware/authentication');

// Register route
router.post('/register', authController.register);

// Login route with local strategy
router.post('/login', localAuthMiddleware, authController.login);

// Logout route (protected)
router.post('/logout', authenticationMiddleware, authController.logout);

// Get current user (protected)
router.get('/me', authenticationMiddleware, authController.getCurrentUser);

module.exports = router;
