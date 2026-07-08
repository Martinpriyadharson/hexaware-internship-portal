const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const tokenHeader = req.header('Authorization');
  let token = req.header('x-auth-token');

  if (tokenHeader && tokenHeader.startsWith('Bearer ')) {
    token = tokenHeader.substring(7, tokenHeader.length);
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hexaware_secret_jwt_token_key_123!');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
