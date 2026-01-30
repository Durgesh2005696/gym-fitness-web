const prisma = require('./src/utils/prismaClient');

async function checkUser() {
    const email = 'subu@gmail.com';
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('User found:', user);
}

checkUser()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
