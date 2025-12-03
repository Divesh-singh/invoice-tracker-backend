const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const localAuthMiddleware = require('../middleware/localAuth');
const authMiddleware = require('../middleware/auth');

// Register route
router.post('/register', authController.register);

// Login route with local strategy
router.post('/login', localAuthMiddleware, authController.login);

// Logout route (protected)
router.post('/logout', authMiddleware, authController.logout);

// Get current user (protected)
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
