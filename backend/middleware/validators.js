const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Helper to evaluate validation result and send 400 response
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstMsg = errors.array()[0].msg;
    return res.status(400).json({ 
      status: 400,
      msg: firstMsg, 
      errors: errors.array() 
    });
  }
  next();
};

// User Registration Validation Schema
const validateRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// User Login Validation Schema
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Profile Update Validation Schema
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('mobile')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Mobile number format is invalid'),
  body('cgpa')
    .optional({ checkFalsy: true })
    .custom((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num < 0 || num > 10) {
        throw new Error('CGPA must be a valid number between 0.0 and 10.0');
      }
      return true;
    }),
  body('graduationYear')
    .optional({ checkFalsy: true })
    .custom((val) => {
      const year = parseInt(val);
      if (isNaN(year) || year < 2000 || year > 2100) {
        throw new Error('Graduation year must be a valid year');
      }
      return true;
    }),
  handleValidationErrors
];

// Validate ObjectId Route Parameter
const validateObjectIdParam = (paramName = 'id') => [
  param(paramName).custom((val) => {
    if (!mongoose.Types.ObjectId.isValid(val)) {
      throw new Error(`Invalid ${paramName} parameter`);
    }
    return true;
  }),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateObjectIdParam
};
