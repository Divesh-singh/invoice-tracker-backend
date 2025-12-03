const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
};

module.exports = authMiddleware;
