const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticationMiddleware = require('../middleware/authentication');
const authorize = require('../middleware/authorization');


// Get all users (protected, admin only)
router.get('/', authenticationMiddleware, authorize(2), userController.getAllUsers);

// Update user
router.put('/:id', authenticationMiddleware, userController.updateUser);

// Delete user (protected, superadmin and admin only)
router.delete('/:id', authenticationMiddleware, authorize(2), userController.deleteUser);

module.exports = router;
