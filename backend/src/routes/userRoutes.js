const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, userController.getAllUsers);
router.get('/clients', protect, userController.getClients);
router.get('/trainers', protect, admin, userController.getAllTrainers);
router.post('/trainer', protect, admin, userController.createTrainer); // NEW: Create trainer (Admin only)
router.put('/status', protect, admin, userController.toggleUserStatus);
router.put('/assign', protect, admin, userController.assignTrainer); // Updated: Admin only
router.put('/renew', protect, admin, userController.renewSubscription);
router.delete('/:id', protect, admin, userController.deleteUser);
router.put('/profile/questionnaire', protect, userController.updateQuestionnaire);

module.exports = router;

