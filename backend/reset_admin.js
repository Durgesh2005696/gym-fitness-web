const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: { password: password },
    });
    console.log('Admin password reset to password123');
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
