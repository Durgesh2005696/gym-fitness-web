const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all exercises (with filtering)
// @route   GET /api/exercises
// @access  Private (Trainer/Admin)
const getExercises = async (req, res) => {
    try {
        const { search, muscleGroup, equipment, category, type } = req.query; // type for veg/non-veg equivalent? No.

        let where = {};

        // Search by name
        if (search) {
            where.name = { contains: search }; // SQLite case-insensitive? No. Prisma needs 'mode: insensitive' for Postgres, but for SQLite usually we rely on default.
            // Wait, Prisma + MySQL is case insensitive by default. Prisma + Postgres needs mode.
            // I'll assume standard usage.
        }

        if (muscleGroup && muscleGroup !== 'All') where.muscleGroup = muscleGroup;
        if (equipment && equipment !== 'All') where.equipment = equipment;
        if (category && category !== 'All') where.category = category;

        // Custom trainer exercises or System defaults (createdByTrainer is null)
        // If we want trainers to see ONLY their custom + system, we need OR logic.
        // where: { OR: [ { createdByTrainer: null }, { createdByTrainer: req.user.id } ], ...params }
        // But since we are building a library, maybe shared?
        // User said: "Trainer can Add custom exercises". Typically private.

        where.OR = [
            { createdByTrainer: null }, // System
            { createdByTrainer: req.user.id } // My custom
        ];

        const exercises = await prisma.exercise.findMany({
            where,
            orderBy: { name: 'asc' }
        });

        res.json(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create custom exercise
// @route   POST /api/exercises
// @access  Private (Trainer)
const createExercise = async (req, res) => {
    try {
        const { name, muscleGroup, category, equipment, difficulty, instructions, setsDefault, repsDefault, caloriesBurnEstimate } = req.body;

        if (!name || !muscleGroup) {
            return res.status(400).json({ message: 'Name and Muscle Group are required' });
        }

        const exercise = await prisma.exercise.create({
            data: {
                name,
                muscleGroup,
                category: category || 'Strength',
                equipment: equipment || 'Bodyweight',
                difficulty: difficulty || 'Intermediate',
                instructions,
                setsDefault: setsDefault ? String(setsDefault) : '3',
                repsDefault: repsDefault ? String(repsDefault) : '10',
                caloriesBurnEstimate: caloriesBurnEstimate ? parseInt(caloriesBurnEstimate) : 0,
                createdByTrainer: req.user.id
            }
        });

        res.status(201).json(exercise);
    } catch (error) {
        console.error('Error creating exercise:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getExercises,
    createExercise
};
