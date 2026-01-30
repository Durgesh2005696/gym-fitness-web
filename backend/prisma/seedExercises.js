const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const exercises = [
    // CHEST
    { name: 'Barbell Bench Press', muscleGroup: 'Chest', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Dumbbell Fly', muscleGroup: 'Chest', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Push-Up', muscleGroup: 'Chest', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15-20' },
    { name: 'Cable Crossover', muscleGroup: 'Chest', category: 'Strength', equipment: 'Cable', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Dips', muscleGroup: 'Chest', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Machine Chest Press', muscleGroup: 'Chest', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Decline Bench Press', muscleGroup: 'Chest', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Pec Deck Machine', muscleGroup: 'Chest', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Svend Press', muscleGroup: 'Chest', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '15' },

    // BACK
    { name: 'Deadlift', muscleGroup: 'Back', category: 'Strength', equipment: 'Barbell', difficulty: 'Advanced', setsDefault: '3', repsDefault: '5-8' },
    { name: 'Pull-Up', muscleGroup: 'Back', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: 'MAX' },
    { name: 'Lat Pulldown', muscleGroup: 'Back', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Barbell Row', muscleGroup: 'Back', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Seated Cable Row', muscleGroup: 'Back', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Dumbbell Row', muscleGroup: 'Back', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Face Pull', muscleGroup: 'Back', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15-20' },
    { name: 'T-Bar Row', muscleGroup: 'Back', category: 'Strength', equipment: 'Machine', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Hyperextension', muscleGroup: 'Back', category: 'Strength', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15' },
    { name: 'Straight Arm Pulldown', muscleGroup: 'Back', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },

    // LEGS
    { name: 'Barbell Squat', muscleGroup: 'Legs', category: 'Strength', equipment: 'Barbell', difficulty: 'Advanced', setsDefault: '4', repsDefault: '5-8' },
    { name: 'Leg Press', muscleGroup: 'Legs', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Walking Lunges', muscleGroup: 'Legs', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '12/leg' },
    { name: 'Leg Extension', muscleGroup: 'Legs', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Hamstring Curl', muscleGroup: 'Legs', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Romanian Deadlift', muscleGroup: 'Legs', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Calf Raise', muscleGroup: 'Legs', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '4', repsDefault: '15-20' },
    { name: 'Goblet Squat', muscleGroup: 'Legs', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Bulgarian Split Squat', muscleGroup: 'Legs', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Advanced', setsDefault: '3', repsDefault: '8-10/leg' },
    { name: 'Glute Bridge', muscleGroup: 'Legs', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15-20' },

    // SHOULDERS
    { name: 'Overhead Press', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Lateral Raise', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Front Raise', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Rear Delt Fly', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15-20' },
    { name: 'Arnold Press', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Upright Row', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Shrugs', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15' },

    // ARMS
    { name: 'Barbell Bicep Curl', muscleGroup: 'Arms', category: 'Strength', equipment: 'Barbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Hammer Curl', muscleGroup: 'Arms', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Tricep Pushdown', muscleGroup: 'Arms', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Skull Crusher', muscleGroup: 'Arms', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Preacher Curl', muscleGroup: 'Arms', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Tricep Dips', muscleGroup: 'Arms', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10-15' },
    { name: 'Concentration Curl', muscleGroup: 'Arms', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12' },
    { name: 'Overhead Tricep Ext', muscleGroup: 'Arms', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },

    // CORE
    { name: 'Plank', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '60s' },
    { name: 'Crunches', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '20' },
    { name: 'Leg Raises', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '15' },
    { name: 'Russian Twist', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '20' },
    { name: 'Mountain Climbers', muscleGroup: 'Core', category: 'Cardio', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '30s' },
    { name: 'Ab Roller', muscleGroup: 'Core', category: 'Strength', equipment: 'Bodyweight', difficulty: 'Advanced', setsDefault: '3', repsDefault: '10' },

    // CARDIO
    { name: 'Treadmill Run', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '1', repsDefault: '20 mins' },
    { name: 'Cycling', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '1', repsDefault: '20 mins' },
    { name: 'Jump Rope', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '3 mins' },
    { name: 'Rowing Machine', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Machine', difficulty: 'Intermediate', setsDefault: '1', repsDefault: '15 mins' },
    { name: 'Elliptical', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '1', repsDefault: '20 mins' },
    { name: 'Burpees', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Bodyweight', difficulty: 'Advanced', setsDefault: '3', repsDefault: '15' }
];

async function main() {
    console.log(`Start seeding ${exercises.length} exercises...`);

    // Optional: Clear existing exercises?
    // await prisma.exercise.deleteMany({});

    for (const ex of exercises) {
        await prisma.exercise.create({
            data: ex
        });
    }

    console.log('Seeding exercises finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
