const express = require('express');
const router = express.Router();

// Clean destructuring without any structural syntax typos
const { uploadResume } = require('../controllers/resumeController'); 

// Standard middleware declarations
const uploadResumePdf = require('../middleware/uploadResumePdf'); 
const { protect } = require('../middleware/auth'); 

// Clean, comma-separated Express execution chain
router.post('/upload', protect, uploadResumePdf, uploadResume);

module.exports = router;