const express = require('express');
const router = express.Router();
const { getJobs, createJob } = require('../controllers/jobController');

// Import BOTH protect and checkRole from the authentication middleware
const { protect, checkRole } = require('../middleware/auth');

// Perfect positional middleware verification sequences
router.get('/', getJobs);
router.post('/', protect, checkRole(['recruiter', 'admin']), createJob);

module.exports = router;