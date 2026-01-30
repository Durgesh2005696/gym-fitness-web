const express = require('express');
const router = express.Router();
const {
    protect,
    admin,
    allowPendingTrainer,
    allowAssignedClient,
    requireActiveTrainer
} = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// ============================================
// LEGACY ROUTES (Backward Compatible)
// ============================================

// Submit generic payment (legacy)
router.post('/', protect, paymentController.submitPayment);

// Get my payment history
router.get('/my-payments', protect, paymentController.getMyPayments);

// ============================================
// TRAINER → ADMIN PAYMENT ROUTES
// ============================================

// Submit trainer subscription payment (Trainer with PENDING status)
router.post('/trainer-subscription',
    protect,
    allowPendingTrainer,
    paymentController.submitTrainerPayment
);

// ============================================
// CLIENT → TRAINER PAYMENT ROUTES
// ============================================

// Submit client activation payment (Client with assigned trainer)
router.post('/client-activation',
    protect,
    allowAssignedClient,
    paymentController.submitClientPayment
);

// Get trainer's QR code for payment
router.get('/trainer-qr/:trainerId', protect, paymentController.getTrainerQRCode);

// ============================================
// ADMIN PAYMENT MANAGEMENT
// ============================================

// Get all pending trainer payments (Admin)
router.get('/pending', protect, admin, paymentController.getPendingPayments);

// Approve trainer payment (Admin)
router.put('/:id/approve', protect, admin, paymentController.approvePayment);

// Reject payment (Admin)
router.put('/:id/reject', protect, admin, paymentController.rejectPayment);

// ============================================
// TRAINER PAYMENT MANAGEMENT (for Clients)
// ============================================

// Get pending client payments (Trainer)
router.get('/pending/clients',
    protect,
    requireActiveTrainer,
    paymentController.getTrainerPendingPayments
);

// Approve client payment (Trainer)
router.put('/:id/approve-client',
    protect,
    requireActiveTrainer,
    paymentController.approveClientPayment
);

// Reject client payment (Trainer)
router.put('/:id/reject-client',
    protect,
    requireActiveTrainer,
    paymentController.rejectClientPayment
);

module.exports = router;
