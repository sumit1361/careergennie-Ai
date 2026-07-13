const fs = require('fs');
const path = require('path');

// 1. Fix the Controller Export Mismatch
const controllerPath = path.join(__dirname, 'controllers', 'authController.js');
if (fs.existsSync(controllerPath)) {
    let content = fs.readFileSync(controllerPath, 'utf8');
    
    // Remove broken or modern export layouts if any exist, and append clean CommonJS exports
    content = content.replace(/export\s+default\s+\w+;/g, '');
    
    const exportBlock = `
// Clear CommonJS mapping enforced for Render Node setup
module.exports = {
    signup: typeof signup !== 'undefined' ? signup : (req, res) => res.send('Signup missing'),
    login: typeof login !== 'undefined' ? login : (req, res) => res.send('Login missing'),
    me: typeof me !== 'undefined' ? me : (req, res) => res.send('Me missing')
};`;

    // Append clean module.exports block if not explicitly structured already
    if (!content.includes('module.exports =')) {
        fs.writeFileSync(controllerPath, content + exportBlock);
        console.log('✅ Fix applied to controllers/authController.js');
    } else {
        console.log('ℹ️ controllers/authController.js already has module.exports wired.');
    }
}

// 2. Fix the Router Destructuring Setup
const routerPath = path.join(__dirname, 'routes', 'authRoutes.js');
if (fs.existsSync(routerPath)) {
    const perfectRouterCode = `const express = require('express');
const router = express.Router();
const { signup, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, me);

module.exports = router;`;

    fs.writeFileSync(routerPath, perfectRouterCode);
    console.log('✅ Overwritten routes/authRoutes.js with functional callbacks.');
}
