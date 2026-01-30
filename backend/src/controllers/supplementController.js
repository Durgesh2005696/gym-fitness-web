const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSupplements = async (req, res) => {
    try {
        const { search, category } = req.query;
        let where = {};

        if (search) {
            where.name = { contains: search }; // Case sensitive usually in SQLite/Postgres depends on provider, but standard Prisma
        }
        if (category && category !== 'All') where.category = category;

        // Show System Defaults + Custom created by this trainer
        where.OR = [
            { createdByTrainer: null },
            { createdByTrainer: req.user.id }
        ];

        const supplements = await prisma.supplement.findMany({
            where,
            orderBy: { name: 'asc' }
        });

        res.json(supplements);
    } catch (error) {
        console.error('Error fetching supplements:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const createSupplement = async (req, res) => {
    try {
        const { name, category, mainUse, benefits, whoShouldUse, bestTime, notes } = req.body;

        if (!name || !category) {
            return res.status(400).json({ message: 'Name and Category are required' });
        }

        const supplement = await prisma.supplement.create({
            data: {
                name,
                category,
                mainUse,
                benefits,
                whoShouldUse,
                bestTime,
                notes,
                createdByTrainer: req.user.id
            }
        });

        res.status(201).json(supplement);
    } catch (error) {
        console.error('Error creating supplement:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getSupplements,
    createSupplement
};
