const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Migration script to backfill existing users with new status fields
 * Run this AFTER running prisma migrate
 */
async function migrateUserStatuses() {
    console.log('Starting user status migration...\n');

    // 1. Update Admin users
    const adminResult = await prisma.user.updateMany({
        where: { role: 'ADMIN' },
        data: { accountStatus: 'ACTIVE' }
    });
    console.log(`✓ Updated ${adminResult.count} ADMIN users to ACTIVE`);

    // 2. Update Active Trainers → ACTIVE
    const activeTrainersResult = await prisma.user.updateMany({
        where: {
            role: 'TRAINER',
            isActive: true
        },
        data: { accountStatus: 'ACTIVE' }
    });
    console.log(`✓ Updated ${activeTrainersResult.count} active TRAINER users to ACTIVE`);

    // 3. Update Inactive Trainers → PENDING
    const inactiveTrainersResult = await prisma.user.updateMany({
        where: {
            role: 'TRAINER',
            isActive: false,
            accountStatus: 'PENDING' // Only if not already set
        },
        data: { accountStatus: 'PENDING' }
    });
    console.log(`✓ Updated ${inactiveTrainersResult.count} inactive TRAINER users to PENDING`);

    // 4. Update Client users (set accountStatus to ACTIVE - they can login)
    const clientResult = await prisma.user.updateMany({
        where: { role: 'CLIENT' },
        data: { accountStatus: 'ACTIVE' }
    });
    console.log(`✓ Updated ${clientResult.count} CLIENT users accountStatus to ACTIVE`);

    // 5. Update ClientProfiles - Active clients with trainer → ACTIVE
    const activeClientsResult = await prisma.clientProfile.updateMany({
        where: {
            trainerId: { not: null },
            user: { isActive: true }
        },
        data: { activationStatus: 'ACTIVE' }
    });
    console.log(`✓ Updated ${activeClientsResult.count} active client profiles to ACTIVE`);

    // 6. Clients with trainer but inactive → UNASSIGNED (awaiting payment)
    const unassignedClientsResult = await prisma.clientProfile.updateMany({
        where: {
            trainerId: { not: null },
            user: { isActive: false },
            activationStatus: { not: 'ACTIVE' }
        },
        data: { activationStatus: 'UNASSIGNED' }
    });
    console.log(`✓ Updated ${unassignedClientsResult.count} inactive client profiles to UNASSIGNED`);

    // 7. Clients without trainer → REGISTERED
    const registeredClientsResult = await prisma.clientProfile.updateMany({
        where: {
            trainerId: null,
            activationStatus: { not: 'ACTIVE' }
        },
        data: { activationStatus: 'REGISTERED' }
    });
    console.log(`✓ Updated ${registeredClientsResult.count} unassigned client profiles to REGISTERED`);

    // 8. Update existing payments to include paymentType
    const trainerPaymentsResult = await prisma.payment.updateMany({
        where: {
            user: { role: 'TRAINER' },
            paymentType: 'SUBSCRIPTION'
        },
        data: { paymentType: 'TRAINER_SUBSCRIPTION' }
    });
    console.log(`✓ Updated ${trainerPaymentsResult.count} trainer payments to TRAINER_SUBSCRIPTION`);

    const clientPaymentsResult = await prisma.payment.updateMany({
        where: {
            user: { role: 'CLIENT' },
            paymentType: 'SUBSCRIPTION'
        },
        data: { paymentType: 'CLIENT_ACTIVATION' }
    });
    console.log(`✓ Updated ${clientPaymentsResult.count} client payments to CLIENT_ACTIVATION`);

    console.log('\n✅ Migration complete!');

    // Print summary
    const users = await prisma.user.groupBy({
        by: ['role', 'accountStatus'],
        _count: true
    });
    console.log('\nUser Summary:');
    users.forEach(u => {
        console.log(`  ${u.role} (${u.accountStatus}): ${u._count}`);
    });

    const profiles = await prisma.clientProfile.groupBy({
        by: ['activationStatus'],
        _count: true
    });
    console.log('\nClient Profile Summary:');
    profiles.forEach(p => {
        console.log(`  ${p.activationStatus}: ${p._count}`);
    });
}

migrateUserStatuses()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
