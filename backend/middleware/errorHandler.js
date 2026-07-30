/**
 * Centralized Error Handling Middleware for Express.
 * Handles HTTP 400, 401, 403, 404, and 500 errors.
 * Ensures internal stack traces are NEVER exposed in production API responses.
 */
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  const statusCode = err.status || err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // Sanitized error payload without stack trace exposure
  const responsePayload = {
    status: statusCode,
    msg: err.message || 'An unexpected server error occurred. Please try again.'
  };

  // Specific CORS violation handling
  if (err.message && err.message.includes('CORS policy violation')) {
    return res.status(403).json({
      status: 403,
      msg: 'Access Denied: CORS policy violation.'
    });
  }

  res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
