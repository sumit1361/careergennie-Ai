const express = require('express');
const router = express.Router();
const { applyToJob, getApplications } = require('../controllers/applicationController'); // Replace with your exact function names
const { protect } = require('../middleware/auth');

router.post('/apply', protect, applyToJob);
router.get('/mine', protect, getApplications);

module.exports = router;