const express = require('express');
const router = express.Router();
const { getJobs, createJob, updateJobStatus } = require('../controllers/jobController'); // Replace with your exact function names
const { protect, checkRole } = require('../middleware/auth');

router.get('/', getJobs);
router.post('/', protect, checkRole(['recruiter', 'admin']), createJob);

module.exports = router;