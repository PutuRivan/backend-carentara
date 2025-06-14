const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function authorization(roles) {
  return function (req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];

      let user;
      try {
        user = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
      }

      if (!user.role) {
        return res.status(403).json({ message: 'User role not found in token' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: 'You are not authorized with this role' });
      }

      req.user = user; // inject user ke req
      next();
    } catch (error) {
      res.status(500).json({ message: 'Authorization middleware error', error: error.message });
    }
  };
}

module.exports = authorization;
