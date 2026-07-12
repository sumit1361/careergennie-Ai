const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');

/**
 * @route   POST /api/applications
 * @access  Private (student)
 * Body: { jobId: string }
 * Uses the student's most recent resume's aiFeedback.score as a stand-in
 * matchPercentage if one hasn't already been computed against this job.
 */
const applyToJob = async (req, res, next) => {
  try {
    const { jobId, matchPercentage } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    let resolvedMatch = typeof matchPercentage === 'number' ? matchPercentage : undefined;

    if (resolvedMatch === undefined) {
      const latestResume = await Resume.findOne({ studentId: req.user._id }).sort({
        createdAt: -1,
      });
      resolvedMatch = latestResume?.aiFeedback?.score ?? 0;
    }

    const application = await Application.create({
      jobId,
      studentId: req.user._id,
      matchPercentage: resolvedMatch,
      status: 'applied',
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job',
      });
    }
    next(err);
  }
};

/**
 * @route   GET /api/applications/mine
 * @access  Private (student)
 */
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('jobId', 'title deadline');

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/applications/job/:jobId
 * @access  Private (recruiter, owner of job only)
 */
const getApplicationsForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (String(job.recruiterId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you do not own this job posting',
      });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .sort({ matchPercentage: -1 })
      .populate('studentId', 'name email');

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/applications/:id/status
 * @access  Private (recruiter, owner of the related job only)
 * Body: { status: 'reviewed' | 'accepted' | 'rejected' }
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['applied', 'reviewed', 'accepted', 'rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id).populate('jobId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (String(application.jobId.recruiterId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you do not own the job for this application',
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
};
