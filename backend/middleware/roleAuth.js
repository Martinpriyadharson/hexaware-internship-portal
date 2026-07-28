module.exports = function (roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Unauthorized: User authentication missing' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: `Forbidden: Access restricted to [${roles.join(', ')}]. Your role '${req.user.role}' is unauthorized.` 
      });
    }

    next();
  };
};
