const passport = require('passport');

const localAuthMiddleware = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication error', error: err.message });
    }

    if (!user) {
      return res.status(401).json({ message: info.message || 'Authentication failed' });
    }

    req.user = user;
    next();
  })(req, res, next);
};

module.exports = localAuthMiddleware;
