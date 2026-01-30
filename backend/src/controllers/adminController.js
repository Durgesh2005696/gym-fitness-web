const prisma = require('../utils/prismaClient');

/**
 * @desc    Get SaaS Dashboard Stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // 1. User Stats
        const users = await prisma.user.findMany({
            where: {
                role: { in: ['CLIENT', 'TRAINER'] }
            },
            select: {
                role: true,
                subscriptionExpiresAt: true,
                isActive: true
            }
        });

        const stats = {
            totalActiveClients: 0,
            totalExpiredClients: 0,
            totalActiveTrainers: 0,
            totalExpiredTrainers: 0,
            pendingPaymentsCount: 0,
            todayRevenue: 0
        };

        users.forEach(user => {
            const isExpired = !user.subscriptionExpiresAt || new Date(user.subscriptionExpiresAt) < now;

            if (user.role === 'CLIENT') {
                if (isExpired) stats.totalExpiredClients++;
                else stats.totalActiveClients++;
            } else if (user.role === 'TRAINER') {
                if (isExpired) stats.totalExpiredTrainers++;
                else stats.totalActiveTrainers++;
            }
        });

        // 2. Pending Payments Count
        stats.pendingPaymentsCount = await prisma.payment.count({
            where: { status: 'PENDING' }
        });

        // 3. Today's Revenue
        const todayPayments = await prisma.payment.findMany({
            where: {
                status: 'APPROVED',
                updatedAt: {
                    gte: todayStart
                }
            },
            select: {
                amount: true
            }
        });

        stats.todayRevenue = todayPayments.reduce((acc, curr) => acc + curr.amount, 0);

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
