const prisma = require('../utils/prismaClient');

exports.createPlan = async (req, res) => {
    const { clientId, type, data, validUntil } = req.body;
    try {
        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId: clientId }
        });

        if (!clientProfile) {
            return res.status(404).json({ message: "Client profile not found" });
        }

        // Find existing plan of the same type for this client
        const existingPlan = await prisma.plan.findFirst({
            where: {
                clientProfileId: clientProfile.id,
                type: type
            }
        });

        let plan;
        if (existingPlan) {
            // Update existing plan
            plan = await prisma.plan.update({
                where: { id: existingPlan.id },
                data: {
                    data: (typeof data === 'string' ? data : JSON.stringify(data)),
                    validUntil: validUntil ? new Date(validUntil) : null
                }
            });
        } else {
            // Create new plan
            plan = await prisma.plan.create({
                data: {
                    clientProfileId: clientProfile.id,
                    type,
                    data: (typeof data === 'string' ? data : JSON.stringify(data)),
                    validUntil: validUntil ? new Date(validUntil) : null
                }
            });
        }

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
