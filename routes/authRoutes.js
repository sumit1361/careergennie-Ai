const express = require('express');
const router = express.Router();

// CORRECT FIX: Explicitly destructure your keys from the required module path
const { signup, login, me } = require('../controllers/authController');

// If line 7 looks like this, it will now correctly find the "signup" function:
router.post('/signup', signup); 
router.post('/login', login);

module.exports = router;