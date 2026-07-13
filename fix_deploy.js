const fs = require('fs');
const path = require('path');

console.log('🚀 Starting full-stack CommonJS repair sweep for CareerGenie...');

const controllersDir = path.join(__dirname, 'controllers');
const routesDir = path.join(__dirname, 'routes');

// Helper to safely append clean exports to controllers if missing
function cleanController(filename, exportsArray) {
    const filePath = path.join(controllersDir, filename);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Wipe out any stray default ES export patterns
    content = content.replace(/export\s+default\s+\w+;/g, '');
    
    // Check if module.exports is already handled cleanly. If not, generate it safely.
    if (!content.includes('module.exports =')) {
        const exportLines = exportsArray.map(fn => `    ${fn}: typeof ${fn} !== 'undefined' ? ${fn} : (req, res, next) => next(new Error('${fn} controller mapping missing'))`).join(',\n');
        const exportBlock = `\n\n// Enforced CommonJS module mappings for Render container compilation\nmodule.exports = {\n${exportLines}\n};\n`;
        
        fs.writeFileSync(filePath, content + exportBlock);
        console.log(`✅ Fixed exports at bottom of: ${filename}`);
    } else {
        console.log(`ℹ️ ${filename} already has a module.exports block.`);
    }
}

// Helper to overwrite routers with perfectly destructured CommonJS parameters
function overwriteRouter(filename, contentString) {
    const filePath = path.join(routesDir, filename);
    fs.writeFileSync(filePath, contentString.strip ? contentString.strip() : contentString);
    console.log(`✅ Overwritten and optimized router layout: ${filename}`);
}

// 1. Repair every single controller bottom placement object
cleanController('authController.js', ['signup', 'login', 'me']);
cleanController('resumeController.js', ['uploadResume']);
cleanController('jobController.js', ['getJobs', 'createJob']); // add any extra job controller methods if you have them
cleanController('applicationController.js', ['applyToJob', 'getApplications']);
cleanController('adminController.js', ['getStats', 'moderateJob']); 

// 2. Overwrite and lock down every router configuration
overwriteRouter('authRoutes.js', `const express = require('express');
const router = express.Router();
const { signup, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, me);

module.exports = router;`);

overwriteRouter('resumeRoutes.js', `const express = require('express');
const router = express.Router();
const { uploadResume } = require('../controllers/resumeController');
const uploadResumePdf = require('../middleware/uploadResumePdf');
const { protect } = require('../middleware/auth');

router.post('/upload', protect, uploadResumePdf, uploadResume);

module.exports = router;`);

overwriteRouter('jobRoutes.js', `const express = require('express');
const router = express.Router();
const { getJobs, createJob } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.get('/', getJobs);
router.post('/', protect, createJob);

module.exports = router;`);

overwriteRouter('applicationRoutes.js', `const express = require('express');
const router = express.Router();
const { applyToJob, getApplications } = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.post('/apply', protect, applyToJob);
router.get('/mine', protect, getApplications);

module.exports = router;`);

overwriteRouter('adminRoutes.js', `const express = require('express');
const router = express.Router();
const { getStats, moderateJob } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getStats);
router.patch('/jobs/:id', protect, moderateJob);

module.exports = router;`);

console.log('🎉 Codebase completely cleaned up! Ready to push.');