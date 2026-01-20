const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.post('/', protect, paymentController.submitPayment);
router.get('/pending', protect, admin, paymentController.getPendingPayments);
router.put('/:id/approve', protect, admin, paymentController.approvePayment);
router.put('/:id/reject', protect, admin, paymentController.rejectPayment);

module.exports = router;
