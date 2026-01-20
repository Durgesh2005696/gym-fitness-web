const prisma = require('../utils/prismaClient');

// @desc    Submit a new payment request
// @route   POST /api/payments
// @access  Private
exports.submitPayment = async (req, res) => {
    const { amount, transactionId } = req.body;

    if (!transactionId || !amount) {
        return res.status(400).json({ message: 'Transaction ID and Amount are required' });
    }

    try {
        const payment = await prisma.payment.create({
            data: {
                userId: req.user.id,
                amount: parseFloat(amount),
                transactionId,
                status: 'PENDING'
            }
        });
        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all pending payments
// @route   GET /api/payments/pending
// @access  Admin
exports.getPendingPayments = async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            where: { status: 'PENDING' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a payment
// @route   PUT /api/payments/:id/approve
// @access  Admin
exports.approvePayment = async (req, res) => {
    const { id } = req.params;

    try {
        const payment = await prisma.payment.findUnique({ where: { id } });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status === 'APPROVED') {
            return res.status(400).json({ message: 'Payment already approved' });
        }

        // 1. Update Payment Status
        await prisma.payment.update({
            where: { id },
            data: { status: 'APPROVED' }
        });

        // 2. Activate User & Set Expiry (+30 Days from NOW)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        await prisma.user.update({
            where: { id: payment.userId },
            data: {
                isActive: true,
                subscriptionExpiresAt: expiryDate
            }
        });

        res.json({ message: 'Payment approved and user activated for 30 days' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject a payment
// @route   PUT /api/payments/:id/reject
// @access  Admin
exports.rejectPayment = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.payment.update({
            where: { id },
            data: { status: 'REJECTED' }
        });
        res.json({ message: 'Payment rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
