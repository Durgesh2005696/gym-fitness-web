const express = require('express');
const router = express.Router();
const { getFoods, createFood } = require('../controllers/foodController');
const { protect, trainer } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, trainer, getFoods)
    .post(protect, trainer, createFood);

module.exports = router;
