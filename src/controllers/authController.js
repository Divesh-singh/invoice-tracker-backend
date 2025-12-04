const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserType = require('../models/UserType');
const { JWT_SECRET, JWT_EXPIRE, COOKIE_EXPIRE } = require('../config/constants');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { firstName, lastName, username, password, confirmPassword, usertypeid } = req.body;

      // Validation for basic fields 
      if (!firstName || !lastName || !username || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        first_name: firstName,
        last_name: lastName,
        username,
        password: hashedPassword,
        usertypeid,
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: COOKIE_EXPIRE,
      });

      return res.status(201).json({
        message: 'User registered successfully',
        user: { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName },
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const user = req.user; // Set by localAuthMiddleware

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: COOKIE_EXPIRE,
      });

      return res.status(200).json({
        message: 'Login successful',
        user: { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },

  // Logout user
  logout: (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  },

  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        include: { model: UserType, as: 'userType' },
      });
      delete user.dataValues.password; // Remove password from response
      return res.status(200).json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
  },
};

module.exports = authController;
