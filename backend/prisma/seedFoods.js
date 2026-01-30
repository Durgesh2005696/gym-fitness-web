const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const foods = [
    // PROTEIN
    { foodName: 'Chicken Breast (Raw)', category: 'Protein', calories: 110, protein: 23, carbs: 0, fat: 1.2, vegType: 'Non-Veg', mealType: 'Lunch' },
    { foodName: 'Egg White (Boiled)', category: 'Protein', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, vegType: 'Non-Veg', mealType: 'Breakfast' },
    { foodName: 'Whole Egg (Boiled)', category: 'Protein', calories: 155, protein: 13, carbs: 1.1, fat: 11, vegType: 'Non-Veg', mealType: 'Breakfast' },
    { foodName: 'Paneer (Raw)', category: 'Protein', calories: 296, protein: 18, carbs: 1.2, fat: 20, vegType: 'Veg', mealType: 'Dinner' },
    { foodName: 'Soya Chunks', category: 'Protein', calories: 345, protein: 52, carbs: 33, fat: 0.5, vegType: 'Veg', mealType: 'Lunch' },
    { foodName: 'Fish (Salmon)', category: 'Protein', calories: 208, protein: 20, carbs: 0, fat: 13, vegType: 'Non-Veg', mealType: 'Dinner' },
    { foodName: 'Whey Protein Scoop', category: 'Protein', calories: 120, protein: 24, carbs: 3, fat: 1, vegType: 'Veg', mealType: 'Snack' },
    { foodName: 'Greek Yogurt', category: 'Protein', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, vegType: 'Veg', mealType: 'Snack' },
    { foodName: 'Tofu', category: 'Protein', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, vegType: 'Veg', mealType: 'Lunch' },
    { foodName: 'Mutton (Lean)', category: 'Protein', calories: 143, protein: 25, carbs: 0, fat: 4, vegType: 'Non-Veg', mealType: 'Lunch' },

    // CARBS
    { foodName: 'White Rice (Cooked)', category: 'Carb', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, vegType: 'Veg', mealType: 'Lunch' },
    { foodName: 'Brown Rice (Cooked)', category: 'Carb', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, vegType: 'Veg', mealType: 'Lunch' },
    { foodName: 'Oats (Raw)', category: 'Carb', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, vegType: 'Veg', mealType: 'Breakfast' },
    { foodName: 'Chapati (Wheat)', category: 'Carb', calories: 297, protein: 11, carbs: 55, fat: 3.5, vegType: 'Veg', mealType: 'Dinner' },
    { foodName: 'Sweet Potato (Boiled)', category: 'Carb', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, vegType: 'Veg', mealType: 'Snack' },
    { foodName: 'Potato (Boiled)', category: 'Carb', calories: 87, protein: 1.9, carbs: 20, fat: 0.1, vegType: 'Veg', mealType: 'Lunch' },
    { foodName: 'Banana', category: 'Carb', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, vegType: 'Veg', mealType: 'Snack' },
    { foodName: 'Apple', category: 'Carb', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, vegType: 'Veg', mealType: 'Snack' },
    { foodName: 'Quinoa (Cooked)', category: 'Carb', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, vegType: 'Veg', mealType: 'Lunch' },
    { foodName: 'Bread (Whole Wheat)', category: 'Carb', calories: 247, protein: 13, carbs: 41, fat: 3.4, vegType: 'Veg', mealType: 'Breakfast' },

    // FATS
    { foodName: 'Almonds', category: 'Fat', calories: 579, protein: 21, carbs: 22, fat: 50, vegType: 'Veg', mealType: 'Snack' },
    { foodName: 'Walnuts', category: 'Fat', calories: 654, protein: 15, carbs: 14, fat: 65, vegType: 'Veg', mealType: 'Snack' },
    { foodName: 'Peanut Butter', category: 'Fat', calories: 588, protein: 25, carbs: 20, fat: 50, vegType: 'Veg', mealType: 'Snack' },
    { foodName: 'Olive Oil', category: 'Fat', calories: 884, protein: 0, carbs: 0, fat: 100, vegType: 'Veg', mealType: 'Lunch' },
    { foodName: 'Ghee', category: 'Fat', calories: 900, protein: 0, carbs: 0, fat: 100, vegType: 'Veg', mealType: 'Dinner' },

    // VEGETABLES
    { foodName: 'Broccoli', category: 'Vegetable', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, vegType: 'Veg', mealType: 'Dinner' },
    { foodName: 'Spinach', category: 'Vegetable', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, vegType: 'Veg', mealType: 'Lunch' },
    { foodName: 'Cucumber', category: 'Vegetable', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, vegType: 'Veg', mealType: 'Snack' },
    { foodName: 'Tomato', category: 'Vegetable', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, vegType: 'Veg', mealType: 'Lunch' },

    // SNACKS
    { foodName: 'Dark Chocolate (70%)', category: 'Snack', calories: 600, protein: 7.8, carbs: 46, fat: 43, vegType: 'Veg', mealType: 'Snack' }
];

async function main() {
    console.log('Seeding foods...');
    for (const food of foods) {
        // Avoid duplicates by name
        const exists = await prisma.food.findFirst({
            where: { foodName: food.foodName }
        });

        if (!exists) {
            await prisma.food.create({ data: food });
        }
    }
    console.log('Food seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
