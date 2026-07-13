const express = require('express');
const router = express.Router();

// Explicit destructuring ensures Express hooks actual functions for callbacks
const { signup, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Verified functional route mappings
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, me);

module.exports = router;