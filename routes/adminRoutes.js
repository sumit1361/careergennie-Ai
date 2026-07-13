const express = require('express');
const router = express.Router();
const { getStats, moderateJob } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// Inline admin check to prevent crashes
const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access only"
    });
  }
  next();
};

router.get('/stats', protect, checkAdmin, getStats);
router.patch('/jobs/:id', protect, checkAdmin, moderateJob);

module.exports = router;