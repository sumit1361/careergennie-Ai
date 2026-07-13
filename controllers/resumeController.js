const express = require('express');
const router = express.Router();

// CORRECT DESTURCTURING: Extracts the individual function out of the controller object
const { uploadResume } = require('../controllers/resumeController'); 

// Regular singular function middleware assignments
const uploadResumePdf = require('../middleware/uploadResumePdf'); 
const { protect } = require('../middleware/auth');

// Positional execution validation checks
router.post('/upload', protect, uploadResumePdf, uploadResume);

module.exports = router;