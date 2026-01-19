const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/qr', protect, settingController.getQRCode);
router.post('/qr', protect, admin, settingController.updateQRCode);

module.exports = router;
