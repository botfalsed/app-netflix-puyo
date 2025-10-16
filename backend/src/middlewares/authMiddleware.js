const jwt = require('jsonwebtoken');
const config = require('../config');

// Simple auth middleware: reads Authorization: Bearer <token>
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing_token' });
  
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'invalid_token' });
  }
  
  try {
    const payload = jwt.verify(parts[1], config.jwtSecret);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

module.exports = authMiddleware;