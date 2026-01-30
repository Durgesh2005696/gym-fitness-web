require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const foods = [
    // Proteins
    { foodName: 'Chicken Breast (Raw)', category: 'Protein', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, vegType: 'Non-Veg', fiberPer100g: 0 },
    { foodName: 'Egg (Whole)', category: 'Protein', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, vegType: 'Non-Veg', fiberPer100g: 0 },
    { foodName: 'Egg Whites', category: 'Protein', caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2, vegType: 'Non-Veg', fiberPer100g: 0 },
    { foodName: 'Salmon (Raw)', category: 'Protein', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, vegType: 'Non-Veg', fiberPer100g: 0 },
    { foodName: 'Tofu (Firm)', category: 'Protein', caloriesPer100g: 144, proteinPer100g: 15.7, carbsPer100g: 3.8, fatPer100g: 8.7, vegType: 'Veg', fiberPer100g: 0.3 },
    { foodName: 'Greek Yogurt (Plain)', category: 'Dairy', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4, vegType: 'Veg', fiberPer100g: 0 },
    { foodName: 'Cottage Cheese (Paneer)', category: 'Dairy', caloriesPer100g: 296, proteinPer100g: 18, carbsPer100g: 1, fatPer100g: 25, vegType: 'Veg', fiberPer100g: 0 },
    { foodName: 'Whey Protein (Standard Scoop)', category: 'Supplement', caloriesPer100g: 400, proteinPer100g: 80, carbsPer100g: 10, fatPer100g: 5, vegType: 'Veg', fiberPer100g: 0 }, // Approx for 100g powder

    // Carbs
    { foodName: 'White Rice (Raw)', category: 'Grains', caloriesPer100g: 365, proteinPer100g: 7, carbsPer100g: 80, fatPer100g: 0.7, vegType: 'Veg', fiberPer100g: 1.3 },
    { foodName: 'Brown Rice (Raw)', category: 'Grains', caloriesPer100g: 367, proteinPer100g: 7.5, carbsPer100g: 76, fatPer100g: 3.2, vegType: 'Veg', fiberPer100g: 3.4 },
    { foodName: 'Oats (Rolled)', category: 'Grains', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatPer100g: 6.9, vegType: 'Veg', fiberPer100g: 10.6 },
    { foodName: 'Sweet Potato (Raw)', category: 'Vegetable', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, vegType: 'Veg', fiberPer100g: 3 },
    { foodName: 'Potato (Raw)', category: 'Vegetable', caloriesPer100g: 77, proteinPer100g: 2, carbsPer100g: 17, fatPer100g: 0.1, vegType: 'Veg', fiberPer100g: 2.2 },
    { foodName: 'Banana', category: 'Fruit', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, vegType: 'Veg', fiberPer100g: 2.6 },
    { foodName: 'Apple', category: 'Fruit', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, vegType: 'Veg', fiberPer100g: 2.4 },

    // Fats
    { foodName: 'Almonds', category: 'Nuts', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, vegType: 'Veg', fiberPer100g: 12.5 },
    { foodName: 'Peanut Butter', category: 'Nuts', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, vegType: 'Veg', fiberPer100g: 6 },
    { foodName: 'Olive Oil', category: 'Fat', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, vegType: 'Veg', fiberPer100g: 0 },
    { foodName: 'Avocado', category: 'Fruit', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15, vegType: 'Veg', fiberPer100g: 7 },

    // Vegetables
    { foodName: 'Broccoli', category: 'Vegetable', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, vegType: 'Veg', fiberPer100g: 2.6 },
    { foodName: 'Spinach', category: 'Vegetable', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, vegType: 'Veg', fiberPer100g: 2.2 },
];

const exercises = [
    // Chest
    { name: 'Flat Bench Press', muscleGroup: 'Chest', category: 'Barbell', equipment: 'Bench, Barbell', difficulty: 'Intermediate', setsDefault: '4', repsDefault: '8-12', instructions: 'Lie back on a flat bench. Using a medium width grip, lift the bar from the rack and hold it straight over your body. Breathe in and begin coming down slowly until the bar touches your middle chest. After a brief pause, push the bar back to the starting position as you breathe out.' },
    { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', category: 'Dumbbell', equipment: 'Incline Bench, Dumbbells', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12', instructions: 'Lie on an incline bench with a dumbbell in each hand. Press the weights up over your chest.' },
    { name: 'Cable Fly', muscleGroup: 'Chest', category: 'Cable', equipment: 'Cable Machine', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Push Up', muscleGroup: 'Chest', category: 'Bodyweight', equipment: 'None', difficulty: 'Beginner', setsDefault: '3', repsDefault: 'Failure' },

    // Back
    { name: 'Pull Up', muscleGroup: 'Back', category: 'Bodyweight', equipment: 'Pull-up Bar', difficulty: 'Advanced', setsDefault: '3', repsDefault: 'Failure', instructions: 'Grab the pull-up bar with your palms facing forward. Pull your body up until your chin is above the bar.' },
    { name: 'Lat Pulldown', muscleGroup: 'Back', category: 'Machine', equipment: 'Cable Machine', difficulty: 'Beginner', setsDefault: '4', repsDefault: '10-12' },
    { name: 'Barbell Row', muscleGroup: 'Back', category: 'Barbell', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '4', repsDefault: '8-12' },
    { name: 'Seated Cable Row', muscleGroup: 'Back', category: 'Machine', equipment: 'Cable Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12' },

    // Legs
    { name: 'Barbell Squat', muscleGroup: 'Legs', category: 'Barbell', equipment: 'Rack, Barbell', difficulty: 'Advanced', setsDefault: '4', repsDefault: '6-10', instructions: 'Place the barbell on your upper back. Squat down by bending your hips and knees while keeping your back straight. Go down until your thighs are parallel to the floor.' },
    { name: 'Leg Press', muscleGroup: 'Legs', category: 'Machine', equipment: 'Leg Press Machine', difficulty: 'Beginner', setsDefault: '4', repsDefault: '10-15' },
    { name: 'Walking Lunge', muscleGroup: 'Legs', category: 'Dumbbell', equipment: 'Dumbbells', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '12 steps each' },
    { name: 'Leg Extension', muscleGroup: 'Legs', category: 'Machine', equipment: 'Leg Extension Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15' },

    // Shoulders
    { name: 'Overhead Press', muscleGroup: 'Shoulders', category: 'Barbell', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '4', repsDefault: '8-12' },
    { name: 'Lateral Raise', muscleGroup: 'Shoulders', category: 'Dumbbell', equipment: 'Dumbbells', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15' },
    { name: 'Face Pull', muscleGroup: 'Shoulders', category: 'Cable', equipment: 'Cable Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15-20' },

    // Arms
    { name: 'Barbell Curl', muscleGroup: 'Biceps', category: 'Barbell', equipment: 'Barbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Tricep Pushdown', muscleGroup: 'Triceps', category: 'Cable', equipment: 'Cable Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Hammer Curl', muscleGroup: 'Biceps', category: 'Dumbbell', equipment: 'Dumbbells', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12' },
    { name: 'Skullcrusher', muscleGroup: 'Triceps', category: 'Barbell', equipment: 'EZ Bar, Bench', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10-12' },
];

const supplements = [
    { name: 'Whey Protein Isolate', category: 'Protein', mainUse: 'Muscle Recovery', benefits: 'Fast absorption, high protein content.', whoShouldUse: 'Anyone looking to increase protein intake.', bestTime: 'Post-workout or anytime needed.', notes: 'Mix with water for faster digestion.' },
    { name: 'Creatine Monohydrate', category: 'Performance', mainUse: 'Strength & Power', benefits: 'Increases ATP production, improves strength.', whoShouldUse: 'Strength athletes, bodybuilders.', bestTime: 'Anytime (consistency is key).', notes: 'Drink plenty of water. 5g daily.' },
    { name: 'Multivitamin', category: 'General Health', mainUse: 'Micronutrient Support', benefits: 'Fills nutritional gaps.', whoShouldUse: 'General population.', bestTime: 'With first meal.', notes: 'Choose a high-quality brand.' },
    { name: 'Fish Oil (Omega-3)', category: 'General Health', mainUse: 'Heart & Joint Health', benefits: 'Anti-inflammatory, brain health.', whoShouldUse: 'Everyone.', bestTime: 'With meals.', notes: 'Look for high EPA/DHA.' },
    { name: 'Pre-Workout', category: 'Energy', mainUse: 'Energy & Focus', benefits: 'Increases alertness and blood flow.', whoShouldUse: 'Those needing an energy boost before training.', bestTime: '20-30 mins pre-workout.', notes: 'Watch caffeine intake.' },
    { name: 'BCAA', category: 'Recovery', mainUse: 'Muscle Preservation', benefits: 'May reduce muscle breakdown.', whoShouldUse: 'Training fasted.', bestTime: 'Intra-workout.', notes: 'Whey already contains BCAAs.' },
];

async function main() {
    console.log('Seeding Food Library...');
    for (const food of foods) {
        await prisma.food.create({ data: food });
    }

    console.log('Seeding Exercise Library...');
    for (const exercise of exercises) {
        await prisma.exercise.create({ data: exercise });
    }

    console.log('Seeding Supplement Library...');
    for (const sup of supplements) {
        await prisma.supplement.create({ data: sup });
    }

    console.log('Libraries populated successfully! 🚀');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
