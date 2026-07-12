const express = require('express');
const {
  createJob,
  listJobs,
  listMyJobs,
  getJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect, checkRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', listJobs);
router.get('/mine', protect, checkRole(['recruiter']), listMyJobs);
router.get('/:id', getJob);
router.post('/', protect, checkRole(['recruiter']), createJob);
router.patch('/:id', protect, checkRole(['recruiter']), updateJob);
router.delete('/:id', protect, checkRole(['recruiter']), deleteJob);

module.exports = router;
