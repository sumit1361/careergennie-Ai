const path = require('path');
const { spawn } = require('child_process');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');

const ANALYZER_PATH = path.join(__dirname, '..', '..', 'ml', 'analyzer.py');;
const PYTHON_BIN = process.env.PYTHON_BIN || 'python';;

/**
 * runAnalyzer
 * Spawns `ml/analyzer.py <resumeText> <jobDescriptionText>` and resolves
 * with the parsed JSON object printed on stdout. stderr is only used for
 * diagnostics (spaCy warnings, import noise) and never parsed as data.
 */
const runAnalyzer = (resumeText, jobDescriptionText) => {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON_BIN, [ANALYZER_PATH, resumeText, jobDescriptionText], {
      // Keep argv-based piping simple and explicit; no shell interpolation.
      shell: false,
    });

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    child.on('error', (err) => {
      // e.g. python3 binary not found
      reject(new Error(`Failed to start analyzer process: ${err.message}`));
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Analyzer exited with code ${code}. stderr: ${stderrData.trim() || '(empty)'}`
          )
        );
        return;
      }

      try {
        // Contract: exactly one line of pure JSON on stdout.
        const line = stdoutData.trim().split('\n').pop();
        const parsed = JSON.parse(line);
        resolve(parsed);
      } catch (parseErr) {
        reject(
          new Error(
            `Failed to parse analyzer stdout as JSON: ${parseErr.message}. Raw stdout: ${stdoutData}`
          )
        );
      }
    });
  });
};

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

    const analysis = await runAnalyzer(rawText, jdText);

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
