const prisma = require('../utils/prismaClient');

// ============================================
// LEGACY PAYMENT FLOW (Backward Compatible)
// ============================================

/**
 * @desc    Submit a new payment request (legacy)
 * @route   POST /api/payments
 * @access  Private
 */
exports.submitPayment = async (req, res) => {
    const { amount, transactionId, screenshotUrl } = req.body;

    if (!transactionId) {
        return res.status(400).json({ message: 'Transaction ID is required' });
    }

    try {
        // Determine payment type based on role
        const paymentType = req.user.role === 'TRAINER'
            ? 'TRAINER_SUBSCRIPTION'
            : 'CLIENT_ACTIVATION';

        // Get price from settings
        const settings = await prisma.systemSetting.findFirst();
        const paymentAmount = amount || (
            req.user.role === 'TRAINER'
                ? settings?.trainerPrice || 659
                : settings?.clientPrice || 6000
        );

        const payment = await prisma.payment.create({
            data: {
                userId: req.user.id,
                amount: parseFloat(paymentAmount),
                transactionId,
                screenshotUrl,
                paymentType,
                status: 'PENDING'
            }
        });
        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================
// TRAINER PAYMENT FLOW (Trainer → Admin)
// ============================================

/**
 * @desc    Submit trainer subscription payment
 * @route   POST /api/payments/trainer-subscription
 * @access  Private (Trainer with PENDING/PAYMENT_SUBMITTED status)
 */
exports.submitTrainerPayment = async (req, res) => {
    const { transactionId, screenshotUrl } = req.body;
    const userId = req.user.id;

    if (!transactionId) {
        return res.status(400).json({ message: 'Transaction ID is required' });
    }

    try {
        // Validate user is a trainer
        if (req.user.role !== 'TRAINER') {
            return res.status(403).json({ message: 'Only trainers can use this endpoint' });
        }

        // Check if already active or payment submitted
        if (req.user.accountStatus === 'ACTIVE') {
            return res.status(400).json({
                message: 'Account already active',
                accountStatus: req.user.accountStatus
            });
        }

        // Check for existing pending payment
        const existingPayment = await prisma.payment.findFirst({
            where: {
                userId,
                paymentType: 'TRAINER_SUBSCRIPTION',
                status: 'PENDING'
            }
        });

        if (existingPayment) {
            return res.status(400).json({
                message: 'You already have a pending payment. Please wait for admin approval.',
                paymentId: existingPayment.id
            });
        }

        // Get trainer price from settings
        const settings = await prisma.systemSetting.findFirst();
        const amount = settings?.trainerPrice || 659;

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                userId,
                receiverId: null, // Admin receives (null = platform)
                paymentType: 'TRAINER_SUBSCRIPTION',
                amount,
                transactionId,
                screenshotUrl,
                status: 'PENDING'
            }
        });

        // Update trainer status to PAYMENT_SUBMITTED
        await prisma.user.update({
            where: { id: userId },
            data: { accountStatus: 'PAYMENT_SUBMITTED' }
        });

        res.status(201).json({
            message: 'Payment submitted. Awaiting admin approval.',
            payment,
            accountStatus: 'PAYMENT_SUBMITTED'
        });
    } catch (error) {
        console.error('Trainer payment error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ============================================
// CLIENT PAYMENT FLOW (Client → Trainer)
// ============================================

/**
 * @desc    Submit client activation payment to trainer
 * @route   POST /api/payments/client-activation
 * @access  Private (Client with assigned trainer)
 */
exports.submitClientPayment = async (req, res) => {
    const { transactionId, screenshotUrl } = req.body;
    const userId = req.user.id;

    if (!transactionId) {
        return res.status(400).json({ message: 'Transaction ID is required' });
    }

    try {
        const clientProfile = req.user.clientProfile;

        // Validate client state
        if (!clientProfile) {
            return res.status(400).json({ message: 'Client profile not found' });
        }

        if (!clientProfile.trainerId) {
            return res.status(400).json({
                message: 'No trainer assigned. Share your email with a trainer first.',
                code: 'NO_TRAINER_ASSIGNED'
            });
        }

        if (clientProfile.activationStatus === 'ACTIVE') {
            return res.status(400).json({
                message: 'Already activated',
                activationStatus: 'ACTIVE'
            });
        }

        // Check for existing pending payment
        const existingPayment = await prisma.payment.findFirst({
            where: {
                userId,
                paymentType: 'CLIENT_ACTIVATION',
                status: 'PENDING'
            }
        });

        if (existingPayment) {
            return res.status(400).json({
                message: 'You already have a pending payment. Please wait for trainer approval.',
                paymentId: existingPayment.id
            });
        }

        // Get client price from settings
        const settings = await prisma.systemSetting.findFirst();
        const amount = settings?.clientPrice || 6000;

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                userId,
                receiverId: clientProfile.trainerId,
                paymentType: 'CLIENT_ACTIVATION',
                amount,
                transactionId,
                screenshotUrl,
                status: 'PENDING'
            }
        });

        // Update client status to PENDING_PAYMENT
        await prisma.clientProfile.update({
            where: { userId },
            data: { activationStatus: 'PENDING_PAYMENT' }
        });

        res.status(201).json({
            message: 'Payment submitted. Awaiting trainer approval.',
            payment,
            activationStatus: 'PENDING_PAYMENT'
        });
    } catch (error) {
        console.error('Client payment error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ============================================
// ADMIN PAYMENT MANAGEMENT
// ============================================

/**
 * @desc    Get all pending payments (Admin sees trainer payments)
 * @route   GET /api/payments/pending
 * @access  Admin
 */
exports.getPendingPayments = async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            where: {
                status: 'PENDING',
                // Admin sees trainer subscription payments
                OR: [
                    { paymentType: 'TRAINER_SUBSCRIPTION' },
                    { receiverId: null }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        accountStatus: true
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

/**
 * @desc    Approve a trainer payment (Admin only)
 * @route   PUT /api/payments/:id/approve
 * @access  Admin
 */
exports.approvePayment = async (req, res) => {
    const { id } = req.params;

    try {
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status === 'APPROVED') {
            return res.status(400).json({ message: 'Payment already approved' });
        }

        // Get System Settings for Duration
        const settings = await prisma.systemSetting.findFirst();
        const duration = settings?.subscriptionDuration || 30;

        // Calculate expiry date
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + duration);

        // Transaction: Update payment + user statuses
        await prisma.$transaction([
            // Update Payment Status
            prisma.payment.update({
                where: { id },
                data: { status: 'APPROVED' }
            }),
            // Activate User & Set Expiry
            prisma.user.update({
                where: { id: payment.userId },
                data: {
                    isActive: true,
                    accountStatus: 'ACTIVE',
                    subscriptionExpiresAt: expiryDate
                }
            })
        ]);

        res.json({
            message: `Payment approved and user activated for ${duration} days`,
            expiryDate,
            accountStatus: 'ACTIVE'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Reject a payment (Admin)
 * @route   PUT /api/payments/:id/reject
 * @access  Admin
 */
exports.rejectPayment = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Transaction: Update payment + user statuses
        await prisma.$transaction([
            prisma.payment.update({
                where: { id },
                data: { status: 'REJECTED' }
            }),
            // For trainers, set account to REJECTED
            ...(payment.user.role === 'TRAINER' ? [
                prisma.user.update({
                    where: { id: payment.userId },
                    data: { accountStatus: 'REJECTED' }
                })
            ] : [])
        ]);

        res.json({
            message: 'Payment rejected',
            reason: reason || 'No reason provided'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================
// TRAINER PAYMENT MANAGEMENT (for Clients)
// ============================================

/**
 * @desc    Get pending client payments for trainer
 * @route   GET /api/payments/pending/clients
 * @access  Private (Trainer)
 */
exports.getTrainerPendingPayments = async (req, res) => {
    const trainerId = req.user.id;

    try {
        const payments = await prisma.payment.findMany({
            where: {
                receiverId: trainerId,
                status: 'PENDING',
                paymentType: 'CLIENT_ACTIVATION'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        clientProfile: {
                            select: {
                                activationStatus: true
                            }
                        }
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

/**
 * @desc    Trainer approves client payment
 * @route   PUT /api/payments/:id/approve-client
 * @access  Private (Trainer - owner of payment)
 */
exports.approveClientPayment = async (req, res) => {
    const { id } = req.params;
    const trainerId = req.user.id;

    try {
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                user: {
                    include: { clientProfile: true }
                }
            }
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Verify trainer owns this payment (or is admin)
        if (payment.receiverId !== trainerId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to approve this payment' });
        }

        if (payment.status !== 'PENDING') {
            return res.status(400).json({ message: 'Payment already processed' });
        }

        // Get subscription duration
        const settings = await prisma.systemSetting.findFirst();
        const duration = settings?.subscriptionDuration || 30;

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + duration);

        // Transaction: Update payment + client statuses
        await prisma.$transaction([
            prisma.payment.update({
                where: { id },
                data: { status: 'APPROVED' }
            }),
            prisma.user.update({
                where: { id: payment.userId },
                data: {
                    isActive: true,
                    subscriptionExpiresAt: expiryDate
                }
            }),
            prisma.clientProfile.update({
                where: { userId: payment.userId },
                data: { activationStatus: 'ACTIVE' }
            })
        ]);

        res.json({
            message: `Client activated for ${duration} days`,
            expiryDate,
            activationStatus: 'ACTIVE'
        });
    } catch (error) {
        console.error('Approve client payment error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Trainer rejects client payment
 * @route   PUT /api/payments/:id/reject-client
 * @access  Private (Trainer - owner of payment)
 */
exports.rejectClientPayment = async (req, res) => {
    const { id } = req.params;
    const trainerId = req.user.id;
    const { reason } = req.body;

    try {
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { user: { include: { clientProfile: true } } }
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Verify trainer owns this payment (or is admin)
        if (payment.receiverId !== trainerId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to reject this payment' });
        }

        // Transaction: Update payment + reset client status
        await prisma.$transaction([
            prisma.payment.update({
                where: { id },
                data: { status: 'REJECTED' }
            }),
            // Reset client status to allow retry
            prisma.clientProfile.update({
                where: { userId: payment.userId },
                data: { activationStatus: 'UNASSIGNED' }
            })
        ]);

        res.json({
            message: 'Client payment rejected. They can resubmit.',
            reason: reason || 'No reason provided',
            activationStatus: 'UNASSIGNED'
        });
    } catch (error) {
        console.error('Reject client payment error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ============================================
// UTILITY ENDPOINTS
// ============================================

/**
 * @desc    Get trainer's QR code (for client payment page)
 * @route   GET /api/payments/trainer-qr/:trainerId
 * @access  Private (Client with assigned trainer)
 */
exports.getTrainerQRCode = async (req, res) => {
    const { trainerId } = req.params;

    try {
        // Verify the requesting client is assigned to this trainer
        if (req.user.role === 'CLIENT') {
            if (req.user.clientProfile?.trainerId !== trainerId) {
                return res.status(403).json({ message: 'Not assigned to this trainer' });
            }
        }

        const trainer = await prisma.user.findUnique({
            where: { id: trainerId },
            select: {
                id: true,
                name: true,
                paymentQrCode: true
            }
        });

        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        res.json({
            trainerId: trainer.id,
            trainerName: trainer.name,
            qrCode: trainer.paymentQrCode
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get my payment history
 * @route   GET /api/payments/my-payments
 * @access  Private
 */
exports.getMyPayments = async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
