require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '1d',
  COOKIE_EXPIRE: process.env.COOKIE_EXPIRE || 1 * 24 * 60 * 60 * 1000, // 1 days in milliseconds
};
