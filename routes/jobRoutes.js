const express = require('express');
const router = express.Router();
const { getJobs, createJob } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

// Inline role check to preserve your auth.js layout
const checkRecruiterOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'recruiter' && req.user.role !== 'admin')) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Only recruiters or admins can post jobs"
    });
  }
  next();
};

router.get('/', getJobs);
router.post('/', protect, checkRecruiterOrAdmin, createJob);

module.exports = router;