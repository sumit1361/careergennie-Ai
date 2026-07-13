const Resume = require('../models/Resume');
const analyzeResume = require('../service/geminiService');
const pdfParse = require('pdf-parse');


/**
 * Upload and analyze resume
 * POST /api/resume/upload
 */
const uploadResume = async (req, res, next) => {
  try {
    let rawText = req.body.rawText || "";

    // Extract text from uploaded PDF
    if (req.file) {
      try {
        const parsedPdf = await pdfParse(req.file.buffer);
        rawText = parsedPdf.text;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: `Could not read PDF: ${error.message}`
        });
      }
    }

    if (!rawText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume file or text is required"
      });
    }


    const jobDescription = req.body.jobDescription || "";


    // Send resume text to Gemini
    const analysis = await analyzeResume(
      rawText,
      jobDescription
    );


    // Save result in MongoDB
    const resume = await Resume.create({
      studentId: req.user._id,

      rawText,

      parsedProfile: {
        skills: analysis.skills || [],
        experienceYears: analysis.experienceYears || 0
      },

      aiFeedback: {
        score: analysis.score || 0,
        suggestions: analysis.suggestions || []
      }
    });


    res.status(201).json({
      success: true,
      resume,
      analysis
    });


  } catch (error) {
    next(error);
  }
};



/**
 * Get logged-in student's resumes
 * GET /api/resume/mine
 */
const getMyResumes = async (req, res, next) => {

  try {

    const resumes = await Resume
      .find({
        studentId: req.user._id
      })
      .sort({
        createdAt: -1
      });


    res.json({
      success: true,
      count: resumes.length,
      resumes
    });


  } catch(error) {
    next(error);
  }

};



// At the bottom of resumeController.js, jobController.js, etc.
// ... your resume upload and parsing logic above ...

module.exports = {
    uploadResume
};