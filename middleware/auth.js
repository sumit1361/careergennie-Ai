const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect
 * Verifies the `Authorization: Bearer <token>` header, decodes the JWT
 * using process.env.JWT_SECRET, and attaches the authenticated user
 * (minus password) to req.user. Rejects with 401 on any failure.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: missing Bearer token',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: token missing',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Not authorized: token expired'
          : 'Not authorized: invalid token';
      return res.status(401).json({ success: false, message });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: user no longer exists',
      });
    }

    req.user = user; // full Mongoose doc, password excluded via schema `select: false`
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * checkRole
 * Factory middleware for role-based gating. Usage:
 *   router.post('/jobs', protect, checkRole(['recruiter']), createJob);
 */
const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: no authenticated user on request',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of roles [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};

module.exports = { protect, checkRole };
