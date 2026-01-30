const express = require('express');
const router = express.Router();
const coachingController = require('../controllers/coachingController');
const { protect, trainer, verifyClientOwnership, checkTrainerSubscription, checkClientSubscription } = require('../middleware/authMiddleware');

// Dashboard Data - Requires ownership verification
router.get('/client/:clientId', protect, verifyClientOwnership, coachingController.getClientDetails);

const upload = require('../middleware/uploadMiddleware');
const { handleMulterError } = require('../middleware/uploadMiddleware');

// Client Actions (self-only, validated by controller using req.user.id) - requires active subscription
router.post('/activity', protect, checkClientSubscription, coachingController.updateDailyActivity);
router.post('/feedback', protect, checkClientSubscription, coachingController.submitDailyFeedback);
router.post('/photos', protect, checkClientSubscription, upload.single('photo'), handleMulterError, coachingController.uploadProgressPhoto);

// Progress - Can be submitted by Client (self) or Trainer (with ownership check)
router.post('/progress', protect, verifyClientOwnership, coachingController.addProgressRecord);

// Trainer adds client by email - requires active subscription
router.post('/add-client', protect, trainer, checkTrainerSubscription, coachingController.addClientByEmail);

// Trainer can update client body stats
router.put('/client/:clientId/body-stats', protect, trainer, verifyClientOwnership, coachingController.updateBodyStats);

// Trainer removes client
router.put('/remove-client/:clientId', protect, trainer, coachingController.removeClient);

module.exports = router;
