const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');

/**
 * Base authentication - verifies JWT + single session
 */
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user with full profile data for status checks
            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    accountStatus: true,
                    loginToken: true,
                    subscriptionExpiresAt: true,
                    paymentQrCode: true,
                    clientProfile: {
                        select: {
                            id: true,
                            activationStatus: true,
                            trainerId: true,
                            isQuestionnaireFilled: true
                        }
                    },
                    trainerProfile: {
                        select: {
                            id: true,
                            specialization: true
                        }
                    }
                }
            });

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check Single Device Login
            if (decoded.loginToken !== req.user.loginToken) {
                return res.status(401).json({
                    message: 'Session expired. Logged in on another device.',
                    code: 'SESSION_EXPIRED'
                });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Admin-only access
 */
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

/**
 * Trainer or Admin access (basic role check only)
 */
exports.trainer = (req, res, next) => {
    if (req.user && (req.user.role === 'TRAINER' || req.user.role === 'ADMIN')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a trainer' });
    }
};

/**
 * Require ACTIVE Trainer account status
 * Trainers must have accountStatus = 'ACTIVE' and valid subscription
 */
exports.requireActiveTrainer = (req, res, next) => {
    // Admin bypass
    if (req.user?.role === 'ADMIN') {
        return next();
    }

    if (req.user?.role !== 'TRAINER') {
        return res.status(403).json({
            message: 'Trainer access required',
            code: 'NOT_TRAINER'
        });
    }

    // Check account status
    if (req.user.accountStatus !== 'ACTIVE') {
        return res.status(403).json({
            message: 'Trainer account not activated',
            code: 'TRAINER_INACTIVE',
            accountStatus: req.user.accountStatus
        });
    }

    // Check subscription expiry
    if (req.user.subscriptionExpiresAt &&
        new Date(req.user.subscriptionExpiresAt) < new Date()) {
        return res.status(403).json({
            message: 'Trainer subscription expired',
            code: 'TRAINER_EXPIRED'
        });
    }

    next();
};

/**
 * Require ACTIVE Client activation status
 * Clients must have activationStatus = 'ACTIVE' in their profile
 */
exports.requireActiveClient = (req, res, next) => {
    // Admin and Trainer bypass
    if (req.user?.role === 'ADMIN' || req.user?.role === 'TRAINER') {
        return next();
    }

    if (req.user?.role !== 'CLIENT') {
        return res.status(403).json({
            message: 'Client access required',
            code: 'NOT_CLIENT'
        });
    }

    const activationStatus = req.user.clientProfile?.activationStatus;

    if (activationStatus !== 'ACTIVE') {
        return res.status(403).json({
            message: 'Client not activated. Complete payment to your trainer.',
            code: 'CLIENT_INACTIVE',
            activationStatus: activationStatus || 'REGISTERED'
        });
    }

    // Check subscription expiry
    if (req.user.subscriptionExpiresAt &&
        new Date(req.user.subscriptionExpiresAt) < new Date()) {
        return res.status(403).json({
            message: 'Client subscription expired',
            code: 'CLIENT_EXPIRED'
        });
    }

    next();
};

/**
 * Legacy subscription check (for backward compatibility)
 */
exports.checkSubscription = (req, res, next) => {
    // Admin doesn't need subscription
    if (req.user && req.user.role === 'ADMIN') {
        return next();
    }

    if (!req.user || !req.user.subscriptionExpiresAt) {
        return res.status(403).json({ message: 'Subscription required', code: 'EXPIRED' });
    }

    const now = new Date();
    const expiry = new Date(req.user.subscriptionExpiresAt);

    if (now > expiry) {
        return res.status(403).json({ message: 'Subscription expired', code: 'EXPIRED' });
    }

    next();
};

/**
 * Middleware to verify Trainer-Client ownership.
 * Ensures that a Trainer can only access Clients assigned to them.
 * MUST be called AFTER 'protect' middleware.
 * Works with :clientId URL param OR clientId in request body.
 */
exports.verifyClientOwnership = async (req, res, next) => {
    try {
        // Ensure user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Admins bypass ownership check
        if (req.user.role === 'ADMIN') return next();

        // Get clientId from URL params OR request body
        const clientId = req.params.clientId || req.body.clientId;

        if (!clientId) {
            // If no clientId, skip check (might be a general route)
            return next();
        }

        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId: clientId },
            include: { user: true }
        });

        if (!clientProfile) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Client viewing/updating themselves
        if (req.user.role === 'CLIENT') {
            if (req.user.id === clientId) {
                req.clientProfile = clientProfile;
                return next();
            } else {
                return res.status(403).json({ message: 'Access denied. Cannot access other client data.' });
            }
        }

        // Trainer must own the client
        if (req.user.role === 'TRAINER') {
            if (clientProfile.trainerId !== req.user.id) {
                console.warn(`SECURITY: Trainer ${req.user.id} attempted to access Client ${clientId} (owned by ${clientProfile.trainerId})`);
                return res.status(403).json({ message: 'Access denied. This client is not assigned to you.' });
            }

            // Also verify client is ACTIVE (has paid)
            if (clientProfile.activationStatus !== 'ACTIVE') {
                return res.status(403).json({
                    message: 'Client has not completed payment activation',
                    code: 'CLIENT_NOT_ACTIVATED',
                    activationStatus: clientProfile.activationStatus
                });
            }
        }

        // Store for controller use
        req.clientProfile = clientProfile;
        next();
    } catch (error) {
        console.error('Ownership verification error:', error);
        res.status(500).json({ message: 'Authorization check failed' });
    }
};

/**
 * Allow pending operations for unactivated users
 * Used for routes that should be accessible during activation flow
 */
exports.allowPendingTrainer = (req, res, next) => {
    if (req.user?.role !== 'TRAINER') {
        return res.status(403).json({ message: 'Trainer access required' });
    }

    // Allow PENDING or PAYMENT_SUBMITTED trainers
    const allowedStatuses = ['PENDING', 'PAYMENT_SUBMITTED', 'ACTIVE'];
    if (!allowedStatuses.includes(req.user.accountStatus)) {
        return res.status(403).json({
            message: 'Trainer account rejected or suspended',
            code: 'TRAINER_BLOCKED',
            accountStatus: req.user.accountStatus
        });
    }

    next();
};

/**
 * Allow operations for clients with assigned trainer (pre-activation)
 * Used for payment submission routes
 */
exports.allowAssignedClient = (req, res, next) => {
    if (req.user?.role !== 'CLIENT') {
        return res.status(403).json({ message: 'Client access required' });
    }

    const activationStatus = req.user.clientProfile?.activationStatus;
    const hasTrainer = !!req.user.clientProfile?.trainerId;

    // Must have a trainer assigned
    if (!hasTrainer) {
        return res.status(403).json({
            message: 'No trainer assigned. Share your email with a trainer first.',
            code: 'NO_TRAINER_ASSIGNED'
        });
    }

    // Allow UNASSIGNED, PENDING_PAYMENT, or ACTIVE
    const allowedStatuses = ['UNASSIGNED', 'PENDING_PAYMENT', 'ACTIVE'];
    if (!allowedStatuses.includes(activationStatus)) {
        return res.status(403).json({
            message: 'Client activation in invalid state',
            code: 'INVALID_STATE',
            activationStatus
        });
    }

    next();
};

/**
 * Legacy: Trainer subscription check
 */
exports.checkTrainerSubscription = (req, res, next) => {
    if (req.user?.role !== 'TRAINER') {
        return next();
    }

    const expiry = req.user.subscriptionExpiresAt
        ? new Date(req.user.subscriptionExpiresAt)
        : null;
    const now = new Date();

    if (!expiry || now > expiry) {
        return res.status(403).json({
            message: 'Your trainer subscription has expired. Please renew to continue.',
            code: 'TRAINER_EXPIRED'
        });
    }

    next();
};

/**
 * Legacy: Client subscription check
 */
exports.checkClientSubscription = (req, res, next) => {
    if (req.user?.role !== 'CLIENT') {
        return next();
    }

    const expiry = req.user.subscriptionExpiresAt
        ? new Date(req.user.subscriptionExpiresAt)
        : null;
    const now = new Date();

    if (!expiry || now > expiry) {
        return res.status(403).json({
            message: 'Your membership has expired. Please renew to continue.',
            code: 'CLIENT_EXPIRED'
        });
    }

    next();
};
