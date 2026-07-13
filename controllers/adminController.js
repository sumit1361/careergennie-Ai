const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');

/**
 * getStats
 * Fetches platform overview metrics for the admin dashboard.
 */
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        users: totalUsers,
        jobs: totalJobs,
        applications: totalApplications,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * moderateJob
 * Updates job moderation status (approved / rejected).
 */
const moderateJob = async (req, res, next) => {
  try {
    const { status } = req.body; // expected: 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats,
  moderateJob,
};