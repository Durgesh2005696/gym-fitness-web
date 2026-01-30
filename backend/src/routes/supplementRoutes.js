const express = require('express');
const router = express.Router();
const supplementController = require('../controllers/supplementController');
const { protect, trainer } = require('../middleware/authMiddleware');

router.get('/', protect, trainer, supplementController.getSupplements);
router.post('/', protect, trainer, supplementController.createSupplement);

module.exports = router;
