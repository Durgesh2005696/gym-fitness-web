const prisma = require('../utils/prismaClient');

exports.createLog = async (req, res) => {
    const { type, value, date } = req.body;
    const userId = req.user.id;

    try {
        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId }
        });

        if (!clientProfile) {
            return res.status(404).json({ message: 'Client profile not found' });
        }

        const log = await prisma.log.create({
            data: {
                clientProfileId: clientProfile.id,
                type,
                value,
                date: date ? new Date(date) : undefined
            }
        });

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLogs = async (req, res) => {
    const userId = req.user.id;
    const { type, date } = req.query;

    try {
        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId }
        });

        if (!clientProfile) {
            return res.json([]);
        }

        let whereClause = { clientProfileId: clientProfile.id };
        if (type) whereClause.type = type;

        // Date filtering is tricky with DateTime.
        // For simple lookup, we might just return recent logs or ALL logs for that type and filter in frontend.
        // Or implement range checks. Let's return all for now or last 7 days.

        const logs = await prisma.log.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
            take: 50
        });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
