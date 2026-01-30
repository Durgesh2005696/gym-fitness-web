const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all foods (System + Trainer Custom)
// @route   GET /api/foods
// @access  Private (Trainer)
const getFoods = async (req, res) => {
    try {
        const { search, category, vegType } = req.query;

        // Base Query
        let where = {};

        // 1. Search filter
        if (search) {
            where.foodName = {
                contains: search
            };
        }

        // 2. Category filter
        if (category && category !== 'All') {
            where.category = category;
        }

        // 3. Veg/Non-Veg filter
        if (vegType && vegType !== 'All') {
            where.vegType = vegType;
        }

        // 4. Auth Scope: Show System Foods (createdByTrainer=null) OR My Custom Foods
        const trainerId = req.user.id;

        where.AND = [
            {
                OR: [
                    { createdByTrainer: null }, // System foods
                    { createdByTrainer: trainerId } // My custom foods
                ]
            }
        ];

        const foods = await prisma.food.findMany({
            where: where,
            orderBy: { foodName: 'asc' },
            take: 200 // Limit to prevent overload
        });

        res.json(foods);
    } catch (error) {
        console.error('Error fetching foods:', error);
        res.status(500).json({ message: 'Server Error fetching foods' });
    }
};

// @desc    Create custom food
// @route   POST /api/foods
// @access  Private (Trainer)
const createFood = async (req, res) => {
    try {
        // Extract Macros & Micros
        const {
            foodName, category, vegType,
            caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fiberPer100g,
            calcium, iron, magnesium, potassium, sodium, zinc,
            vitaminA, vitaminB6, vitaminB12, vitaminC, vitaminD, vitaminE
        } = req.body;

        if (!foodName || !caloriesPer100g) {
            return res.status(400).json({ message: 'Name and Calories are required' });
        }

        const food = await prisma.food.create({
            data: {
                foodName,
                category: category || 'Snack',
                vegType: vegType || 'Veg',

                // Macros
                caloriesPer100g: parseFloat(caloriesPer100g),
                proteinPer100g: parseFloat(proteinPer100g || 0),
                carbsPer100g: parseFloat(carbsPer100g || 0),
                fatPer100g: parseFloat(fatPer100g || 0),
                fiberPer100g: parseFloat(fiberPer100g || 0),

                // Micros
                calcium: parseFloat(calcium || 0),
                iron: parseFloat(iron || 0),
                magnesium: parseFloat(magnesium || 0),
                potassium: parseFloat(potassium || 0),
                sodium: parseFloat(sodium || 0),
                zinc: parseFloat(zinc || 0),
                vitaminA: parseFloat(vitaminA || 0),
                vitaminB6: parseFloat(vitaminB6 || 0),
                vitaminB12: parseFloat(vitaminB12 || 0),
                vitaminC: parseFloat(vitaminC || 0),
                vitaminD: parseFloat(vitaminD || 0),
                vitaminE: parseFloat(vitaminE || 0),

                createdByTrainer: req.user.id
            }
        });

        res.status(201).json(food);
    } catch (error) {
        console.error('Error creating food:', error);
        res.status(500).json({ message: 'Server Error creating food' });
    }
};

module.exports = {
    getFoods,
    createFood
};
