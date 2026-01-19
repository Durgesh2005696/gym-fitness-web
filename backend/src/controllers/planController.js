const prisma = require('../utils/prismaClient');

exports.createPlan = async (req, res) => {
    const { clientId, type, data, validUntil } = req.body;
    try {
        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId: clientId } // Assuming we pass userId for convenience, we need clientProfileId. 
            // Let's find client profile first
        });

        if (!clientProfile) {
            return res.status(404).json({ message: "Client profile not found" });
        }

        const plan = await prisma.plan.create({
            data: {
                clientProfileId: clientProfile.id,
                type,
                data: JSON.stringify(data), // Store as string if JSON
                validUntil: validUntil ? new Date(validUntil) : null
            }
        });
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPlansForClient = async (req, res) => {
    const { clientId } = req.params;
    try {
        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId: clientId }
        });

        if (!clientProfile) return res.json([]);

        const plans = await prisma.plan.findMany({
            where: { clientProfileId: clientProfile.id }
        });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
