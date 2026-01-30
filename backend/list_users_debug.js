const prisma = require('./src/utils/prismaClient');

async function listUsers() {
    const users = await prisma.user.findMany();
    console.log('Total Users:', users.length);
    users.forEach(u => console.log(`- ${u.email} (${u.role})`));
}

listUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
