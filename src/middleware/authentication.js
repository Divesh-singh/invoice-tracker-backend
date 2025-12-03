const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const { User, UserType } = require('../models');

// Verifies JWT from cookie and attaches full user to req.user
const authenticationMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);

    // decoded should contain at least an id
    if (!decoded || !decoded.id) return res.status(401).json({ message: 'Invalid token payload' });

    // Load full user from DB
    const user = await User.findByPk(decoded.id, {
      include: { model: UserType, as: 'userType' },
    });

    if (!user) return res.status(401).json({ message: 'User not found' });

    // Attach minimal safe user info to request
    req.user = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType ? { id: user.userType.id, name: user.userType.name, access_level: user.userType.access_level } : null,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
  }
};

module.exports = authenticationMiddleware;
