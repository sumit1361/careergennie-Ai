const express = require('express');
const router = express.Router();

// Import the correct controller functions mapping to your actual application file
const applicationController = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

// Safely match the function name whether it is listApplications or getMyApplications
const applyToJob = applicationController.applyToJob || applicationController.createApplication;
const getApplications = applicationController.listApplications || 
                        applicationController.getMyApplications || 
                        applicationController.getApplications;

router.post('/apply', protect, applyToJob);
router.get('/mine', protect, getApplications);

module.exports = router;