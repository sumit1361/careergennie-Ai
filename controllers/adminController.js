const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

/**
 * @route   GET /api/admin/jobs?status=pending
 * @access  Private (admin)
 * Defaults to pending jobs (the moderation queue) if no status is given.
 */
const listJobsForModeration = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : { status: 'pending' };

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .populate('recruiterId', 'name email');

    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/admin/jobs/:id/approve
 * @access  Private (admin)
 */
const approveJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/admin/jobs/:id/reject
 * @access  Private (admin)
 */
const rejectJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/users
 * @access  Private (admin)
 */
const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private (admin)
 * Body: { role: 'student' | 'recruiter' | 'admin' }
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['student', 'recruiter', 'admin'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `role must be one of: ${allowedRoles.join(', ')}`,
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/stats
 * @access  Private (admin)
 * Lightweight platform usage summary for the admin dashboard.
 */
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStudents, totalRecruiters, totalJobs, pendingJobs, totalApplications] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'recruiter' }),
        Job.countDocuments(),
        Job.countDocuments({ status: 'pending' }),
        Application.countDocuments(),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalRecruiters,
        totalJobs,
        pendingJobs,
        totalApplications,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ... your moderation, user management, and stats logic above ...

module.exports = {
    getStats,
    moderateJob
};