const express = require('express');

const authMiddleware = require('../middleware/auth');
console.log("AUTH DEBUG:", authMiddleware);

const { protect, checkRole } = authMiddleware;

const {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
} = require('../controllers/applicationController');

const router = express.Router();

router.post('/', protect, checkRole(['student']), applyToJob);
router.get('/mine', protect, checkRole(['student']), getMyApplications);
router.get('/job/:jobId', protect, checkRole(['recruiter']), getApplicationsForJob);
router.patch('/:id/status', protect, checkRole(['recruiter']), updateApplicationStatus);

module.exports = router;