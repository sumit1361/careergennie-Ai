const Application = require('../models/Application');
const Job = require('../models/Job');

/**
 * applyToJob
 * Handles students submitting applications to specific job listings.
 */
const applyToJob = async (req, res, next) => {
  try {
    const { jobId, resumeText, matchScore } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }

    // Ensure the targeted job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const application = await Application.create({
      jobId,
      studentId: req.user._id,
      resumeText: resumeText || '',
      matchScore: matchScore || 0,
      status: 'applied'
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

/**
 * getMyApplications
 * Retrieves all job applications submitted by the logged-in student.
 */
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('jobId', 'title description');

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyToJob,
  getMyApplications
};