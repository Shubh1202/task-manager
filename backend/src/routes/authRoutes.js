const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Direct Email and Password login for Admin and Employee
router.post('/login', login);

// Get current user profile
router.get('/me', protect, getMe);

module.exports = router;
