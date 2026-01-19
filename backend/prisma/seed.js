const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@example.com',
            password,
            role: 'ADMIN',
            isActive: true,
        },
    });

    // Trainer
    const trainer = await prisma.user.upsert({
        where: { email: 'trainer@example.com' },
        update: {},
        create: {
            name: 'Trainer User',
            email: 'trainer@example.com',
            password,
            role: 'TRAINER',
            isActive: true,
            trainerProfile: {
                create: {
                    specialization: 'General Fitness',
                    bio: 'Experienced trainer ready to help you.',
                },
            },
        },
    });

    // Client
    const client = await prisma.user.upsert({
        where: { email: 'client@example.com' },
        update: {},
        create: {
            name: 'Client User',
            email: 'client@example.com',
            password,
            role: 'CLIENT',
            isActive: true,
            clientProfile: {
                create: {
                    currentWeight: 75.0,
                    height: 175.0,
                    dietaryRestrictions: 'None'
                },
            },
        },
    });

    console.log({ admin, trainer, client });
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
