const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { protect, trainer, checkTrainerSubscription } = require('../middleware/authMiddleware');

// Create/Update plan - requires trainer with active subscription
router.post('/', protect, trainer, checkTrainerSubscription, planController.createPlan);
router.get('/client/:clientId', protect, planController.getPlansForClient);

module.exports = router;
