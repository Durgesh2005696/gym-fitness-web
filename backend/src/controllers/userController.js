const prisma = require('../utils/prismaClient');

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

exports.getClients = async (req, res) => {
    try {
        const clients = await prisma.clientProfile.findMany({
            include: { user: true }
        });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllTrainers = async (req, res) => {
    try {
        const trainers = await prisma.user.findMany({
            where: { role: 'TRAINER' },
            include: { trainerProfile: true }
        });
        res.json(trainers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    const { userId, isActive } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllTrainers = async (req, res) => {
    try {
        const trainers = await prisma.user.findMany({
            where: { role: 'TRAINER' },
            include: { trainerProfile: true }
        });
        res.json(trainers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    const { userId, isActive } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.assignTrainer = async (req, res) => {
    const { clientEmail, trainerId } = req.body; // Changed from clientId to clientEmail
    try {
        // Find user by email first to get the ID
        const clientUser = await prisma.user.findUnique({
            where: { email: clientEmail }
        });

        if (!clientUser) {
            return res.status(404).json({ message: "User with this email not found" });
        }

        if (clientUser.role !== 'CLIENT') {
            return res.status(400).json({ message: "User is not a client" });
        }

        const updatedClient = await prisma.clientProfile.update({
            where: { userId: clientUser.id },
            data: { trainerId }
        });
        res.json(updatedClient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
