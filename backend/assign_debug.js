const prisma = require('./src/utils/prismaClient');

async function assignTrainer() {
    // Force assign the seeded client to the seeded trainer for immediate debugging
    const client = await prisma.user.findUnique({ where: { email: 'client@example.com' } });
    const trainer = await prisma.user.findUnique({ where: { email: 'trainer@example.com' } });

    if (client && trainer) {
        await prisma.clientProfile.update({
            where: { userId: client.id },
            data: { trainerId: trainer.id }
        });
        console.log('Assigned client@example.com to trainer@example.com');
    }
}

assignTrainer()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
