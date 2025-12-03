const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRE, COOKIE_EXPIRE } = require('../config/constants');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { email, password, confirmPassword } = req.body;

      // Validation
      if (!email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Please provide email and password' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create(email, hashedPassword);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: COOKIE_EXPIRE,
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: { id: user.id, email: user.email },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const user = req.user; // Set by localAuthMiddleware

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: COOKIE_EXPIRE,
      });

      res.status(200).json({
        message: 'Login successful',
        user: { id: user.id, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },

  // Logout user
  logout: (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  },

  // Get current user
  getCurrentUser: (req, res) => {
    res.status(200).json({
      user: req.user,
    });
  },
};

module.exports = authController;
