const prisma = require('../utils/prismaClient');

/* =========================
   GET ALL USERS
========================= */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                trainerProfile: true,
                clientProfile: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   GET CLIENTS
========================= */
exports.getClients = async (req, res) => {
    try {
        const clients = await prisma.user.findMany({
            where: { role: 'CLIENT' },
            include: {
                clientProfile: {
                    include: {
                        plans: true
                    }
                }
            }
        });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   GET TRAINERS
========================= */
exports.getAllTrainers = async (req, res) => {
    // Fetch all trainers and their managed clients
    try {
        const trainers = await prisma.user.findMany({
            where: { role: 'TRAINER' },
            include: {
                trainerProfile: true,
                managedClients: true // Include clients linked to this trainer (Correct relation name)
            }
        });
        res.json(trainers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   CREATE TRAINER (Admin Only)
========================= */
const bcrypt = require('bcryptjs');

exports.createTrainer = async (req, res) => {
    const { name, email, password, specialization, bio } = req.body;

    try {
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if email exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create trainer with profile
        const trainer = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'TRAINER',
                isActive: true,
                trainerProfile: {
                    create: {
                        specialization: specialization || 'General Fitness',
                        bio: bio || ''
                    }
                }
            },
            include: {
                trainerProfile: true
            }
        });

        // Remove password from response
        const { password: _, ...trainerData } = trainer;
        res.status(201).json(trainerData);
    } catch (error) {
        console.error('Error creating trainer:', error);
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   TOGGLE USER STATUS
========================= */
exports.toggleUserStatus = async (req, res) => {
    const { userId, isActive } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        let updateData = { isActive };

        // If activating a user who has NEVER had a subscription set (newly registered)
        // OR whose subscription has completely expired (null), give them the default duration.
        if (isActive && !user.isActive && !user.subscriptionExpiresAt) {
            const settings = await prisma.systemSetting.findFirst();
            const duration = settings?.subscriptionDuration || 30;
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + duration);
            updateData.subscriptionExpiresAt = expiryDate;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   ASSIGN TRAINER TO CLIENT (Admin Only)
========================= */
exports.assignTrainer = async (req, res) => {
    const { clientId, clientEmail, trainerId } = req.body;

    try {
        let clientUser;

        // Support both clientId and clientEmail for flexibility
        if (clientId) {
            clientUser = await prisma.user.findUnique({ where: { id: clientId } });
        } else if (clientEmail) {
            clientUser = await prisma.user.findUnique({ where: { email: clientEmail } });
        } else {
            return res.status(400).json({ message: 'Either clientId or clientEmail is required' });
        }

        if (!clientUser)
            return res.status(404).json({ message: 'Client not found' });

        if (clientUser.role !== 'CLIENT')
            return res.status(400).json({ message: 'User is not a client' });

        // Verify trainer exists and is a trainer
        if (trainerId) {
            const trainer = await prisma.user.findUnique({ where: { id: trainerId } });
            if (!trainer || trainer.role !== 'TRAINER') {
                return res.status(400).json({ message: 'Invalid trainer' });
            }
        }

        const updatedClient = await prisma.clientProfile.update({
            where: { userId: clientUser.id },
            data: { trainerId: trainerId || null }, // Allow unassigning by passing null
            include: {
                trainer: true
            }
        });

        res.json(updatedClient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   RENEW SUBSCRIPTION
========================= */
exports.renewSubscription = async (req, res) => {
    const { userId, days = 30 } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user)
            return res.status(404).json({ message: 'User not found' });

        let newExpiry = new Date();

        if (
            user.subscriptionExpiresAt &&
            new Date(user.subscriptionExpiresAt) > new Date()
        ) {
            newExpiry = new Date(user.subscriptionExpiresAt);
        }

        if (!days) {
            const settings = await prisma.systemSetting.findFirst();
            days = settings?.subscriptionDuration || 30;
        }

        newExpiry.setDate(newExpiry.getDate() + Number(days));

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionExpiresAt: newExpiry,
                isActive: true
            }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   UPDATE QUESTIONNAIRE
========================= */
exports.updateQuestionnaire = async (req, res) => {
    const userId = req.user.id;
    const { name, age, height, currentWeight, ...profileData } = req.body;

    try {
        // 1. Update User Name if provided
        if (name) {
            await prisma.user.update({
                where: { id: userId },
                data: { name }
            });
        }

        // 2. Update Client Profile with casted types
        const updatedProfile = await prisma.clientProfile.update({
            where: { userId },
            data: {
                ...profileData,
                age: age ? parseInt(age) : undefined,
                height: height ? parseFloat(height) : undefined,
                currentWeight: currentWeight ? parseFloat(currentWeight) : undefined,
                isQuestionnaireFilled: true
            }
        });

        res.json(updatedProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   DELETE USER (CLEAN DELETE)
========================= */
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                clientProfile: true,
                trainerProfile: true
            }
        });

        if (!user)
            return res.status(404).json({ message: 'User not found' });

        if (user.role === 'ADMIN')
            return res.status(403).json({ message: 'Admin cannot be deleted' });

        if (user.clientProfile) {
            await prisma.clientProfile.delete({ where: { userId: id } });
        }

        if (user.trainerProfile) {
            await prisma.trainerProfile.delete({ where: { userId: id } });
        }

        await prisma.user.delete({ where: { id } });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};