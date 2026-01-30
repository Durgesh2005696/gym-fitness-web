const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const exercises = [
    // --- CHEST ---
    { name: 'Barbell Bench Press', muscleGroup: 'Chest', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Incline Barbell Press', muscleGroup: 'Chest', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Decline Barbell Press', muscleGroup: 'Chest', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Dumbbell Bench Press', muscleGroup: 'Chest', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Decline Dumbbell Press', muscleGroup: 'Chest', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Dumbbell Fly', muscleGroup: 'Chest', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Incline Dumbbell Fly', muscleGroup: 'Chest', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Push-Up', muscleGroup: 'Chest', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15-20' },
    { name: 'Incline Push-Up', muscleGroup: 'Chest', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15-20' },
    { name: 'Decline Push-Up', muscleGroup: 'Chest', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '15-20' },
    { name: 'Cable Crossover', muscleGroup: 'Chest', category: 'Strength', equipment: 'Cable', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Low Cable Crossover', muscleGroup: 'Chest', category: 'Strength', equipment: 'Cable', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '12-15' },
    { name: 'High Cable Crossover', muscleGroup: 'Chest', category: 'Strength', equipment: 'Cable', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Pec Deck Machine', muscleGroup: 'Chest', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Chest Press Machine', muscleGroup: 'Chest', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Dips (Chest Focus)', muscleGroup: 'Chest', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Svend Press', muscleGroup: 'Chest', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '15' },
    { name: 'Landmine Press', muscleGroup: 'Chest', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Archer Push-Up', muscleGroup: 'Chest', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Advanced', setsDefault: '3', repsDefault: '8-10' },

    // --- BACK ---
    { name: 'Deadlift', muscleGroup: 'Back', category: 'Strength', equipment: 'Barbell', difficulty: 'Advanced', setsDefault: '3', repsDefault: '5-8' },
    { name: 'Pull-Up', muscleGroup: 'Back', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: 'MAX' },
    { name: 'Chin-Up', muscleGroup: 'Back', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: 'MAX' },
    { name: 'Lat Pulldown', muscleGroup: 'Back', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Close Grip Lat Pulldown', muscleGroup: 'Back', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Reverse Grip Lat Pulldown', muscleGroup: 'Back', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Barbell Row', muscleGroup: 'Back', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Pendlay Row', muscleGroup: 'Back', category: 'Strength', equipment: 'Barbell', difficulty: 'Advanced', setsDefault: '3', repsDefault: '6-8' },
    { name: 'Seated Cable Row', muscleGroup: 'Back', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'One Arm Dumbbell Row', muscleGroup: 'Back', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Face Pull', muscleGroup: 'Back', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15-20' },
    { name: 'T-Bar Row', muscleGroup: 'Back', category: 'Strength', equipment: 'Machine', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Chest Supported Row', muscleGroup: 'Back', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Hyperextension', muscleGroup: 'Back', category: 'Strength', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15' },
    { name: 'Straight Arm Pulldown', muscleGroup: 'Back', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Inverted Row', muscleGroup: 'Back', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-15' },
    { name: 'Renegade Row', muscleGroup: 'Back', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Advanced', setsDefault: '3', repsDefault: '10/side' },
    { name: 'Good Morning', muscleGroup: 'Back', category: 'Strength', equipment: 'Barbell', difficulty: 'Advanced', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Rack Pull', muscleGroup: 'Back', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '6-8' },
    { name: 'Shrugs', muscleGroup: 'Back', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15' },

    // --- LEGS ---
    { name: 'Barbell Squat', muscleGroup: 'Legs', category: 'Strength', equipment: 'Barbell', difficulty: 'Advanced', setsDefault: '4', repsDefault: '5-8' },
    { name: 'Front Squat', muscleGroup: 'Legs', category: 'Strength', equipment: 'Barbell', difficulty: 'Advanced', setsDefault: '4', repsDefault: '5-8' },
    { name: 'Leg Press', muscleGroup: 'Legs', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Walking Lunges', muscleGroup: 'Legs', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '12/leg' },
    { name: 'Reverse Lunges', muscleGroup: 'Legs', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '12/leg' },
    { name: 'Leg Extension', muscleGroup: 'Legs', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Lying Leg Curl', muscleGroup: 'Legs', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Seated Leg Curl', muscleGroup: 'Legs', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Romanian Deadlift', muscleGroup: 'Legs', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Dumbbell RDL', muscleGroup: 'Legs', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Calf Raise (Standing)', muscleGroup: 'Legs', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '4', repsDefault: '15-20' },
    { name: 'Calf Raise (Seated)', muscleGroup: 'Legs', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '4', repsDefault: '15-20' },
    { name: 'Goblet Squat', muscleGroup: 'Legs', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Bulgarian Split Squat', muscleGroup: 'Legs', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Advanced', setsDefault: '3', repsDefault: '8-10/leg' },
    { name: 'Glute Bridge', muscleGroup: 'Legs', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15-20' },
    { name: 'Hip Thrust', muscleGroup: 'Legs', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Hack Squat', muscleGroup: 'Legs', category: 'Strength', equipment: 'Machine', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-10' },
    { name: 'Step-Ups', muscleGroup: 'Legs', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12/leg' },
    { name: 'Box Jumps', muscleGroup: 'Legs', category: 'Cardio', equipment: 'Box', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10' },
    { name: 'Sumo Deadlift', muscleGroup: 'Legs', category: 'Strength', equipment: 'Barbell', difficulty: 'Advanced', setsDefault: '3', repsDefault: '5-8' },

    // --- SHOULDERS ---
    { name: 'Overhead Press', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Seated Dumbbell Press', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Standing Dumbbell Press', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '8-12' },
    { name: 'Lateral Raise', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Cable', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Front Raise', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Plate Front Raise', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Weight Plate', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Rear Delt Fly', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15-20' },
    { name: 'Reverse Pec Deck', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15-20' },
    { name: 'Arnold Press', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Upright Row', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Cable Face Pull', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15-20' },
    { name: 'Shoulder Shrugs (Barbell)', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Barbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15' },
    { name: 'Egyptian Lateral Raise', muscleGroup: 'Shoulders', category: 'Strength', equipment: 'Cable', difficulty: 'Advanced', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Handstand Pushup', muscleGroup: 'Shoulders', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Advanced', setsDefault: '3', repsDefault: '5-8' },

    // --- ARMS ---
    { name: 'Barbell Bicep Curl', muscleGroup: 'Arms', category: 'Strength', equipment: 'Barbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Dumbbell Bicep Curl', muscleGroup: 'Arms', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Hammer Curl', muscleGroup: 'Arms', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Cable Bicep Curl', muscleGroup: 'Arms', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Preacher Curl', muscleGroup: 'Arms', category: 'Strength', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Concentration Curl', muscleGroup: 'Arms', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12' },
    { name: 'Spider Curl', muscleGroup: 'Arms', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Tricep Pushdown (Rope)', muscleGroup: 'Arms', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Tricep Pushdown (Bar)', muscleGroup: 'Arms', category: 'Strength', equipment: 'Cable', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Skull Crusher', muscleGroup: 'Arms', category: 'Strength', equipment: 'Barbell', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Overhead Tricep Ext', muscleGroup: 'Arms', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },
    { name: 'Tricep Dips', muscleGroup: 'Arms', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10-15' },
    { name: 'Diamond Pushup', muscleGroup: 'Arms', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Kickbacks', muscleGroup: 'Arms', category: 'Strength', equipment: 'Dumbbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '15' },
    { name: 'Reverse Curl', muscleGroup: 'Arms', category: 'Strength', equipment: 'Barbell', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12-15' },

    // --- CORE ---
    { name: 'Plank', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '60s' },
    { name: 'Side Plank', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '45s' },
    { name: 'Crunches', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '20' },
    { name: 'Bicycle Crunches', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '20/side' },
    { name: 'Leg Raises', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '15' },
    { name: 'Hanging Leg Raise', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bar', difficulty: 'Advanced', setsDefault: '3', repsDefault: '10-12' },
    { name: 'Russian Twist', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '20' },
    { name: 'Mountain Climbers', muscleGroup: 'Core', category: 'Cardio', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '30s' },
    { name: 'Ab Roller', muscleGroup: 'Core', category: 'Strength', equipment: 'Bodyweight', difficulty: 'Advanced', setsDefault: '3', repsDefault: '10' },
    { name: 'V-Ups', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Advanced', setsDefault: '3', repsDefault: '15' },
    { name: 'Flutter Kicks', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '30s' },
    { name: 'Cable Woodchopper', muscleGroup: 'Core', category: 'Strength', equipment: 'Cable', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '12/side' },
    { name: 'Dead Bug', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '12/side' },
    { name: 'Hollow Body Hold', muscleGroup: 'Core', category: 'Bodyweight', equipment: 'Bodyweight', difficulty: 'Advanced', setsDefault: '3', repsDefault: '45s' },

    // --- CARDIO ---
    { name: 'Treadmill Run', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '1', repsDefault: '20 mins' },
    { name: 'Treadmill Walk', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '1', repsDefault: '30 mins' },
    { name: 'Cycling', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '1', repsDefault: '20 mins' },
    { name: 'Spin Class', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Machine', difficulty: 'Intermediate', setsDefault: '1', repsDefault: '45 mins' },
    { name: 'Jump Rope', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '3 mins' },
    { name: 'Rowing Machine', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Machine', difficulty: 'Intermediate', setsDefault: '1', repsDefault: '15 mins' },
    { name: 'Elliptical', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Machine', difficulty: 'Beginner', setsDefault: '1', repsDefault: '20 mins' },
    { name: 'Stair Climber', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Machine', difficulty: 'Intermediate', setsDefault: '1', repsDefault: '15 mins' },
    { name: 'Burpees', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Bodyweight', difficulty: 'Advanced', setsDefault: '3', repsDefault: '15' },
    { name: 'Jumping Jacks', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '50' },
    { name: 'High Knees', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Bodyweight', difficulty: 'Beginner', setsDefault: '3', repsDefault: '30s' },
    { name: 'Shadow Boxing', muscleGroup: 'Cardio', category: 'Cardio', equipment: 'Bodyweight', difficulty: 'Intermediate', setsDefault: '3', repsDefault: '3 mins' },
];

async function main() {
    console.log(`Clearing old exercises...`);
    // Delete all existing System exercises (where createdByTrainer is null)
    await prisma.exercise.deleteMany({
        where: { createdByTrainer: null }
    });

    console.log(`Seeding ${exercises.length} updated exercises...`);

    for (const ex of exercises) {
        await prisma.exercise.create({
            data: ex
        });
    }

    console.log('Seeding finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
