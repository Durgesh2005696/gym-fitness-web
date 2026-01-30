// Script to expire a user's subscription for testing
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function expireUser(email) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Set to yesterday

    const user = await prisma.user.update({
        where: { email },
        data: {
            subscriptionExpiresAt: pastDate,
            isActive: true // Keep active so login flow can set it to false
        }
    });

    console.log(`✅ Expired subscription for: ${user.email}`);
    console.log(`   New expiry: ${user.subscriptionExpiresAt}`);
    return user;
}

async function restoreUser(email) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const user = await prisma.user.update({
        where: { email },
        data: {
            subscriptionExpiresAt: futureDate,
            isActive: true
        }
    });

    console.log(`✅ Restored subscription for: ${user.email}`);
    console.log(`   New expiry: ${user.subscriptionExpiresAt}`);
    return user;
}

async function main() {
    const action = process.argv[2]; // 'expire' or 'restore'
    const email = process.argv[3];

    if (!action || !email) {
        console.log('Usage: node test_subscription.js <expire|restore> <email>');
        console.log('Example: node test_subscription.js expire client@example.com');
        process.exit(1);
    }

    try {
        if (action === 'expire') {
            await expireUser(email);
        } else if (action === 'restore') {
            await restoreUser(email);
        } else {
            console.log('Invalid action. Use "expire" or "restore"');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
