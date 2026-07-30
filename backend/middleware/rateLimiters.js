const rateLimit = require('express-rate-limit');

// Authentication Rate Limiter (Login, Register, Password Reset)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 429,
      msg: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.'
    });
  }
});

// Assessment Submission Rate Limiter
const testSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 test submissions per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 429,
      msg: 'Too many assessment submission attempts. Please wait a few minutes before submitting again.'
    });
  }
});

module.exports = {
  authLimiter,
  testSubmitLimiter
};
