const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: { role: 'ADMIN', isActive: true },
        create: {
            name: 'Admin User',
            email: 'admin@example.com',
            password,
            role: 'ADMIN',
            isActive: true,
        },
    });

    // Trainer - with active subscription
    const trainerExpiry = new Date();
    trainerExpiry.setDate(trainerExpiry.getDate() + 30); // 30 days from now

    const trainer = await prisma.user.upsert({
        where: { email: 'trainer@example.com' },
        update: { role: 'TRAINER', isActive: true, subscriptionExpiresAt: trainerExpiry },
        create: {
            name: 'Trainer User',
            email: 'trainer@example.com',
            password,
            role: 'TRAINER',
            isActive: true,
            subscriptionExpiresAt: trainerExpiry,
        },
    });

    // Ensure trainer profile exists
    await prisma.trainerProfile.upsert({
        where: { userId: trainer.id },
        update: {},
        create: {
            userId: trainer.id,
            specialization: 'General Fitness',
            bio: 'Experienced trainer ready to help you.',
        },
    });

    // Client
    const client = await prisma.user.upsert({
        where: { email: 'client@example.com' },
        update: { role: 'CLIENT', isActive: true },
        create: {
            name: 'Client User',
            email: 'client@example.com',
            password,
            role: 'CLIENT',
            isActive: true,
        },
    });

    // Ensure client profile exists AND is assigned to trainer
    await prisma.clientProfile.upsert({
        where: { userId: client.id },
        update: { trainerId: trainer.id }, // Always update trainerId
        create: {
            userId: client.id,
            currentWeight: 75.0,
            height: 175.0,
            dietaryRestrictions: 'None',
            trainerId: trainer.id,
        },
    });

    console.log('Seed complete:', { admin: admin.email, trainer: trainer.email, client: client.email });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
