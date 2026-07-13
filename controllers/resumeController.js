const Resume = require('../models/Resume');
const analyzeResume = require('../service/geminiService');
const pdfParse = require('pdf-parse');

/**
 * runAnalyzer
 * Spawns `ml/analyzer.py <resumeText> <jobDescriptionText>` and resolves
 * with the parsed JSON object printed on stdout. stderr is only used for
 * diagnostics (spaCy warnings, import noise) and never parsed as data.
 */


/**
 * @route   POST /api/resume/upload
 * @access  Private (student)
 * Body: { rawText: string, jobDescription: string }
 */
const uploadResume = async (req, res, next) => {
  try {
    let rawText = req.body.rawText;

    // Primary path: a PDF was uploaded via multipart/form-data (field name "resume"),
    // handled by middleware/uploadResumePdf.js -> req.file.buffer.
    if (req.file) {
      try {
        const parsedPdf = await pdfParse(req.file.buffer);
        rawText = parsedPdf.text;
      } catch (pdfErr) {
        return res.status(400).json({
          success: false,
          message: `Could not read PDF: ${pdfErr.message}`,
        });
      }
    }

    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A PDF file (field "resume") or non-empty rawText is required',
      });
    }

    // Job description is optional at upload time; default to empty string so
    // the Python script can still run skill extraction / partial scoring.
    const jobDescription = req.body.jobDescription;
    const jdText = typeof jobDescription === 'string' ? jobDescription : '';

    const analysis = await analyzeResume(rawText, jdText);

    // Expected analyzer.py output shape:
    // {
    //   "skills": ["React", "Node.js", ...],
    //   "experienceYears": 3,
    //   "matchPercentage": 78,
    //   "score": 82,
    //   "suggestions": ["Add more quantifiable achievements", ...]
    // }

    const resume = await Resume.create({
      studentId: req.user._id,
      rawText,
      parsedProfile: {
        skills: analysis.skills || [],
        experienceYears: analysis.experienceYears || 0,
      },
      aiFeedback: {
        score: analysis.score ?? analysis.matchPercentage ?? 0,
        suggestions: analysis.suggestions || [],
      },
    });

    res.status(201).json({
      success: true,
      resume,
      matchPercentage: analysis.matchPercentage ?? null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/resume/mine
 * @access  Private (student)
 */
const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: resumes.length, resumes });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadResume, getMyResumes };
