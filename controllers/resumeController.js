const { spawn } = require('child_process');
const pdfParse = require('pdf-parse');

/**
 * uploadResume
 * Handles multipart form upload, extracts raw text via pdf-parse,
 * and spawns the spaCy + scikit-learn Python ML analyzer layer.
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file uploaded' });
    }

    // Extract text from the in-memory buffer using pdf-parse
    const data = await pdfParse(req.file.buffer);
    const resumeText = data.text;

    // Default placeholder fallback job description for matching metrics
    const jobDescriptionPlaceholder = "Looking for a software development profile skilled in frontend or backend engineering.";

    // Spawn the Python ML child process as specified by project configuration
    const pythonBin = process.env.PYTHON_BIN || 'python3';
    const pyProcess = spawn(pythonBin, ['ml/analyzer.py', resumeText, jobDescriptionPlaceholder]);

    let outputData = '';
    let errorData = '';

    pyProcess.stdout.on('data', (chunk) => {
      outputData += chunk.toString();
    });

    pyProcess.stderr.on('data', (chunk) => {
      errorData += chunk.toString();
    });

    pyProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}. Stderr: ${errorData}`);
        return res.status(500).json({ success: false, message: 'ML Analysis layer processing failed' });
      }

      try {
        const result = JSON.parse(outputData.trim());
        return res.status(200).json({
          success: true,
          message: 'Resume analyzed successfully',
          data: result
        });
      } catch (parseError) {
        console.error(`Failed to parse ML output: ${outputData}`);
        return res.status(500).json({ success: false, message: 'Invalid output structure returned from analyzer' });
      }
    });

  } catch (error) {
    next(error);
  }
};

// Explicit CommonJS object mapping required by the Express router layer
module.exports = {
  uploadResume
};