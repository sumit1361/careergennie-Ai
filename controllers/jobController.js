const Job = require('../models/Job');

/**
 * @route   POST /api/jobs
 * @access  Private (recruiter)
 */
const createJob = async (req, res, next) => {
  try {
    const { title, description, requiredSkills, deadline } = req.body;

    if (!title || !description || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'title, description, and deadline are required',
      });
    }

    const job = await Job.create({
      recruiterId: req.user._id,
      title,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      deadline,
    });

    res.status(201).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/jobs
 * @access  Public
 * Returns all open (non-expired) jobs, most recent first.
 */
const listJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ deadline: { $gte: new Date() }, status: 'approved' })
      .sort({ createdAt: -1 })
      .populate('recruiterId', 'name email');

    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/jobs/mine
 * @access  Private (recruiter)
 * Returns all jobs posted by the logged-in recruiter, regardless of
 * moderation status, for their dashboard.
 */
const listMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/jobs/:id
 * @access  Public
 */
const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiterId', 'name email');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/jobs/:id
 * @access  Private (recruiter, owner only)
 */
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (String(job.recruiterId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you do not own this job posting',
      });
    }

    const allowedFields = ['title', 'description', 'requiredSkills', 'deadline'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    await job.save();
    res.status(200).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/jobs/:id
 * @access  Private (recruiter, owner only)
 */
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (String(job.recruiterId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you do not own this job posting',
      });
    }

    await job.deleteOne();
    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createJob, listJobs, listMyJobs, getJob, updateJob, deleteJob };
