const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, logController.createLog);
router.get('/', protect, logController.getLogs);

module.exports = router;
