const express = require('express');
const {
  listJobsForModeration,
  approveJob,
  rejectJob,
  listUsers,
  updateUserRole,
  getStats,
} = require('../controllers/adminController');
const { protect, checkRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect, checkRole(['admin'])); // every route below requires an admin

router.get('/stats', getStats);
router.get('/jobs', listJobsForModeration);
router.patch('/jobs/:id/approve', approveJob);
router.patch('/jobs/:id/reject', rejectJob);
router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
