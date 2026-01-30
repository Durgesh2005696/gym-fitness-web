const prisma = require('../../src/utils/prismaClient');
const bcrypt = require('bcryptjs');

/**
 * Test Database Setup Utilities
 */

// Clear all data from database
const clearDatabase = async () => {
    await prisma.log.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.clientProfile.deleteMany();
    await prisma.trainerProfile.deleteMany();
    await prisma.user.deleteMany();
};

// Create test admin user
const createTestAdmin = async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    return await prisma.user.create({
        data: {
            name: 'Test Admin',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
        },
    });
};

// Create test trainer user
const createTestTrainer = async () => {
    const hashedPassword = await bcrypt.hash('trainer123', 10);
    const user = await prisma.user.create({
        data: {
            name: 'Test Trainer',
            email: 'trainer@test.com',
            password: hashedPassword,
            role: 'TRAINER',
            isActive: false,
        },
    });

    await prisma.trainerProfile.create({
        data: {
            userId: user.id,
            specialization: 'Strength Training',
            bio: 'Test trainer bio',
        },
    });

    return user;
};

// Create test client user
const createTestClient = async () => {
    const hashedPassword = await bcrypt.hash('client123', 10);
    const user = await prisma.user.create({
        data: {
            name: 'Test Client',
            email: 'client@test.com',
            password: hashedPassword,
            role: 'CLIENT',
            isActive: false,
        },
    });

    await prisma.clientProfile.create({
        data: {
            userId: user.id,
            age: 25,
            height: 175,
            currentWeight: 70,
            dietType: 'VEG',
            isQuestionnaireFilled: false,
        },
    });

    return user;
};

// Create active client with subscription
const createActiveClient = async () => {
    const hashedPassword = await bcrypt.hash('activeclient123', 10);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const user = await prisma.user.create({
        data: {
            name: 'Active Client',
            email: 'activeclient@test.com',
            password: hashedPassword,
            role: 'CLIENT',
            isActive: true,
            subscriptionExpiresAt: expiryDate,
        },
    });

    await prisma.clientProfile.create({
        data: {
            userId: user.id,
            age: 30,
            height: 180,
            currentWeight: 75,
            dietType: 'NON_VEG',
            isQuestionnaireFilled: true,
        },
    });

    return user;
};

module.exports = {
    clearDatabase,
    createTestAdmin,
    createTestTrainer,
    createTestClient,
    createActiveClient,
};
