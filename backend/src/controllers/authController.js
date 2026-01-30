const prisma = require('../utils/prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id, loginToken) => {
    return jwt.sign({ id, loginToken }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Register a new user (Client by default)
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine account status and activation based on role
        let accountStatus = 'PENDING';
        let isActive = false;

        if (role === 'ADMIN') {
            accountStatus = 'ACTIVE';
            isActive = true;
        } else if (role === 'TRAINER') {
            accountStatus = 'PENDING'; // Must pay admin
            isActive = false;
        } else {
            // CLIENT
            accountStatus = 'ACTIVE'; // Clients can login, but limited dashboard
            isActive = false; // Coaching features locked until trainer activates
        }

        const user = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: role || 'CLIENT',
                accountStatus,
                isActive,
                subscriptionExpiresAt: role === 'ADMIN' ? null : null,
            },
        });

        // Create role-specific profiles
        if (role === 'TRAINER') {
            await prisma.trainerProfile.create({
                data: { userId: user.id },
            });
        } else if (role === 'CLIENT' || !role) {
            await prisma.clientProfile.create({
                data: {
                    userId: user.id,
                    activationStatus: 'REGISTERED' // No trainer yet
                },
            });
        }

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accountStatus: user.accountStatus,
            token: null, // Force login to get token
            message: "Registration successful. Please login."
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Register a new trainer (PENDING status, must pay to activate)
 * @route   POST /api/auth/register-trainer
 * @access  Public
 */
exports.registerTrainer = async (req, res) => {
    const { name, email, password, specialization, bio } = req.body;

    try {
        const userExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'TRAINER',
                accountStatus: 'PENDING', // Must pay admin to activate
                isActive: false,
            },
        });

        await prisma.trainerProfile.create({
            data: {
                userId: user.id,
                specialization,
                bio
            },
        });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: 'TRAINER',
            accountStatus: 'PENDING',
            token: null,
            message: "Trainer registration successful. Login and complete payment to activate your account."
        });
    } catch (error) {
        console.error('Trainer registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                trainerProfile: true,
                clientProfile: true
            }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if trainer is rejected
        if (user.role === 'TRAINER' && user.accountStatus === 'REJECTED') {
            return res.status(403).json({
                message: 'Your trainer application was rejected. Contact support.',
                code: 'TRAINER_REJECTED'
            });
        }

        // Check if account is suspended
        if (user.accountStatus === 'SUSPENDED') {
            return res.status(403).json({
                message: 'Your account has been suspended. Contact support.',
                code: 'ACCOUNT_SUSPENDED'
            });
        }

        // Check subscription expiry and auto-update isActive if expired (for non-admin users)
        let isActive = user.isActive;
        if (user.role !== 'ADMIN' && user.accountStatus === 'ACTIVE') {
            const now = new Date();
            const expiryDate = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
            const isExpired = expiryDate && now > expiryDate;

            if (isExpired && user.isActive) {
                // Auto-set isActive to false if subscription expired
                await prisma.user.update({
                    where: { id: user.id },
                    data: { isActive: false }
                });
                isActive = false;
            }
        }

        // One-device login: generate new loginToken
        const loginToken = crypto.randomUUID();
        await prisma.user.update({
            where: { id: user.id },
            data: { loginToken },
        });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accountStatus: user.accountStatus,
            isActive: isActive,
            subscriptionExpiresAt: user.subscriptionExpiresAt,
            paymentQrCode: user.paymentQrCode,
            profile: user.role === 'TRAINER'
                ? user.trainerProfile
                : {
                    ...user.clientProfile,
                    activationStatus: user.clientProfile?.activationStatus || 'REGISTERED'
                },
            token: generateToken(user.id, loginToken),
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                trainerProfile: true,
                clientProfile: {
                    include: {
                        trainer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                paymentQrCode: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accountStatus: user.accountStatus,
            isActive: user.isActive,
            subscriptionExpiresAt: user.subscriptionExpiresAt,
            paymentQrCode: user.paymentQrCode,
            profile: user.role === 'TRAINER'
                ? user.trainerProfile
                : {
                    ...user.clientProfile,
                    activationStatus: user.clientProfile?.activationStatus || 'REGISTERED',
                    trainer: user.clientProfile?.trainer
                }
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update trainer's payment QR code
 * @route   PUT /api/auth/update-qr
 * @access  Private (Trainer)
 */
exports.updateTrainerQR = async (req, res) => {
    let paymentQrCodeUrl = req.body.paymentQrCode;

    if (req.file) {
        // If file uploaded, construct URL (adjust protocol/domain as needed or use relative path)
        // For local dev, we serve /uploads statically or via a specific route.
        // Assuming there is a static serve or we return the relative path.
        // Let's store the relative path compatible with frontend usage.
        paymentQrCodeUrl = `/uploads/${req.file.filename}`;
    }

    if (!paymentQrCodeUrl) {
        return res.status(400).json({ message: 'QR code image or URL is required' });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { paymentQrCode: paymentQrCodeUrl }
        });

        res.json({
            message: 'Payment QR code updated successfully',
            paymentQrCode: updatedUser.paymentQrCode
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
