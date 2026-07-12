const express = require('express');
const { uploadResume, getMyResumes } = require('../controllers/resumeController');
const { protect, checkRole } = require('../middleware/auth');
const uploadResumePdf = require('../middleware/uploadResumePdf');

const router = express.Router();

// multer runs first: parses multipart/form-data, populates req.file (the PDF)
// and req.body (any accompanying text fields, e.g. jobDescription).
router.post(
  '/upload',
  protect,
  checkRole(['student']),
  uploadResumePdf.single('resume'),
  uploadResume
);
router.get('/mine', protect, checkRole(['student']), getMyResumes);

module.exports = router;
