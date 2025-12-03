// authorization.js
// Usage: const authorize = require('../middleware/authorization');
// router.get('/admin', authenticationMiddleware, authorize(2), handler)

const authorize = (requiredAccessLevel = 1) => {
  return (req, res, next) => {
    try {
      const userType = req?.user?.userType;
      if (!userType) return res.status(403).json({ message: 'Access denied' });

      const userLevel = parseInt(userType.access_level, 10) || 0;
      if (userLevel < requiredAccessLevel) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      return next();
    } catch (err) {
      return res.status(500).json({ message: 'Authorization error', error: err.message });
    }
  };
};

module.exports = authorize;
