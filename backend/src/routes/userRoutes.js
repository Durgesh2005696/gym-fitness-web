const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, userController.getAllUsers);
router.get('/clients', protect, userController.getClients);
router.get('/trainers', protect, admin, userController.getAllTrainers);
router.put('/status', protect, admin, userController.toggleUserStatus);
router.put('/assign', protect, userController.assignTrainer);
router.put('/renew', protect, admin, userController.renewSubscription);
router.delete('/:id', protect, admin, userController.deleteUser); // NEW

module.exports = router;
