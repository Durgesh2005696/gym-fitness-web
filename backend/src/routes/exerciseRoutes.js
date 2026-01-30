const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { protect, trainer } = require('../middleware/authMiddleware');

router.get('/', protect, trainer, exerciseController.getExercises);
router.post('/', protect, trainer, exerciseController.createExercise);

module.exports = router;
