const express = require('express');
const router = express.Router();
const {
    register,
    registerTrainer,
    login,
    getMe,
    updateTrainerQR
} = require('../controllers/authController');
const { protect, requireActiveTrainer } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/register-trainer', registerTrainer);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

// Trainer-only routes
const upload = require('../middleware/uploadMiddleware');
const { handleMulterError } = require('../middleware/uploadMiddleware');

router.put('/update-qr', protect, requireActiveTrainer, upload.single('qrCode'), handleMulterError, updateTrainerQR);

module.exports = router;
