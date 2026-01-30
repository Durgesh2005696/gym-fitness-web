const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const foods = [
    // PROTEIN
    { foodName: 'Chicken Breast (Raw)', category: 'Protein', caloriesPer100g: 110, proteinPer100g: 23, carbsPer100g: 0, fatPer100g: 1.2, vegType: 'Non-Veg' },
    { foodName: 'Egg White (Boiled)', category: 'Protein', caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2, vegType: 'Non-Veg' },
    { foodName: 'Whole Egg (Boiled)', category: 'Protein', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, vegType: 'Non-Veg' },
    { foodName: 'Paneer (Raw)', category: 'Protein', caloriesPer100g: 296, proteinPer100g: 18, carbsPer100g: 1.2, fatPer100g: 20, vegType: 'Veg' },
    { foodName: 'Soya Chunks', category: 'Protein', caloriesPer100g: 345, proteinPer100g: 52, carbsPer100g: 33, fatPer100g: 0.5, vegType: 'Veg' },
    { foodName: 'Fish (Salmon)', category: 'Protein', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, vegType: 'Non-Veg' },
    { foodName: 'Whey Protein Scoop', category: 'Protein', caloriesPer100g: 120, proteinPer100g: 24, carbsPer100g: 3, fatPer100g: 1, vegType: 'Veg' },
    { foodName: 'Greek Yogurt', category: 'Protein', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4, vegType: 'Veg' },
    { foodName: 'Tofu', category: 'Protein', caloriesPer100g: 76, proteinPer100g: 8, carbsPer100g: 1.9, fatPer100g: 4.8, vegType: 'Veg' },
    { foodName: 'Mutton (Lean)', category: 'Protein', caloriesPer100g: 143, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 4, vegType: 'Non-Veg' },
    { foodName: 'Cottage Cheese', category: 'Protein', caloriesPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3, vegType: 'Veg' },
    { foodName: 'Turkey Breast', category: 'Protein', caloriesPer100g: 135, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 1, vegType: 'Non-Veg' },
    { foodName: 'Prawns', category: 'Protein', caloriesPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatPer100g: 0.3, vegType: 'Non-Veg' },
    { foodName: 'Tuna (Canned)', category: 'Protein', caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 0.8, vegType: 'Non-Veg' },

    // CARBS
    { foodName: 'White Rice (Cooked)', category: 'Carb', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, vegType: 'Veg' },
    { foodName: 'Brown Rice (Cooked)', category: 'Carb', caloriesPer100g: 111, proteinPer100g: 2.6, carbsPer100g: 23, fatPer100g: 0.9, vegType: 'Veg' },
    { foodName: 'Oats (Raw)', category: 'Carb', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatPer100g: 6.9, vegType: 'Veg' },
    { foodName: 'Chapati (Wheat)', category: 'Carb', caloriesPer100g: 297, proteinPer100g: 11, carbsPer100g: 55, fatPer100g: 3.5, vegType: 'Veg' },
    { foodName: 'Sweet Potato (Boiled)', category: 'Carb', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, vegType: 'Veg' },
    { foodName: 'Potato (Boiled)', category: 'Carb', caloriesPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20, fatPer100g: 0.1, vegType: 'Veg' },
    { foodName: 'Banana', category: 'Fruit', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3, vegType: 'Veg' },
    { foodName: 'Apple', category: 'Fruit', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, vegType: 'Veg' },
    { foodName: 'Quinoa (Cooked)', category: 'Carb', caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatPer100g: 1.9, vegType: 'Veg' },
    { foodName: 'Bread (Whole Wheat)', category: 'Carb', caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4, vegType: 'Veg' },
    { foodName: 'White Bread', category: 'Carb', caloriesPer100g: 265, proteinPer100g: 9, carbsPer100g: 49, fatPer100g: 3.2, vegType: 'Veg' },
    { foodName: 'Pasta (Cooked)', category: 'Carb', caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1, vegType: 'Veg' },
    { foodName: 'Muesli', category: 'Carb', caloriesPer100g: 340, proteinPer100g: 10, carbsPer100g: 66, fatPer100g: 6, vegType: 'Veg' },
    { foodName: 'Poha (Flattened Rice)', category: 'Carb', caloriesPer100g: 360, proteinPer100g: 6.6, carbsPer100g: 79, fatPer100g: 1.2, vegType: 'Veg' },

    // FATS
    { foodName: 'Almonds', category: 'Nuts', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, vegType: 'Veg' },
    { foodName: 'Walnuts', category: 'Nuts', caloriesPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatPer100g: 65, vegType: 'Veg' },
    { foodName: 'Peanut Butter', category: 'Fat', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, vegType: 'Veg' },
    { foodName: 'Olive Oil', category: 'Fat', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, vegType: 'Veg' },
    { foodName: 'Ghee', category: 'Fat', caloriesPer100g: 900, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, vegType: 'Veg' },
    { foodName: 'Coconut Oil', category: 'Fat', caloriesPer100g: 862, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, vegType: 'Veg' },
    { foodName: 'Avocado', category: 'Fat', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15, vegType: 'Veg' },
    { foodName: 'Cashews', category: 'Nuts', caloriesPer100g: 553, proteinPer100g: 18, carbsPer100g: 30, fatPer100g: 44, vegType: 'Veg' },
    { foodName: 'Flax Seeds', category: 'Seeds', caloriesPer100g: 534, proteinPer100g: 18, carbsPer100g: 29, fatPer100g: 42, vegType: 'Veg' },
    { foodName: 'Chia Seeds', category: 'Seeds', caloriesPer100g: 486, proteinPer100g: 17, carbsPer100g: 42, fatPer100g: 31, vegType: 'Veg' },
    { foodName: 'Pumpkin Seeds', category: 'Seeds', caloriesPer100g: 559, proteinPer100g: 30, carbsPer100g: 11, fatPer100g: 49, vegType: 'Veg' },

    // VEGETABLES
    { foodName: 'Broccoli', category: 'Vegetable', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, vegType: 'Veg' },
    { foodName: 'Spinach', category: 'Vegetable', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, vegType: 'Veg' },
    { foodName: 'Cucumber', category: 'Vegetable', caloriesPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1, vegType: 'Veg' },
    { foodName: 'Tomato', category: 'Vegetable', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, vegType: 'Veg' },
    { foodName: 'Carrot', category: 'Vegetable', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2, vegType: 'Veg' },
    { foodName: 'Capsicum (Bell Pepper)', category: 'Vegetable', caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3, vegType: 'Veg' },
    { foodName: 'Cabbage', category: 'Vegetable', caloriesPer100g: 25, proteinPer100g: 1.3, carbsPer100g: 6, fatPer100g: 0.1, vegType: 'Veg' },
    { foodName: 'Cauliflower', category: 'Vegetable', caloriesPer100g: 25, proteinPer100g: 2, carbsPer100g: 5, fatPer100g: 0.3, vegType: 'Veg' },
    { foodName: 'Mushrooms', category: 'Vegetable', caloriesPer100g: 22, proteinPer100g: 3.1, carbsPer100g: 3.3, fatPer100g: 0.3, vegType: 'Veg' },
    { foodName: 'Onion', category: 'Vegetable', caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9, fatPer100g: 0.1, vegType: 'Veg' },

    // DAIRY
    { foodName: 'Milk (Full Fat)', category: 'Dairy', caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3, vegType: 'Veg' },
    { foodName: 'Milk (Skimmed)', category: 'Dairy', caloriesPer100g: 34, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 0.1, vegType: 'Veg' },
    { foodName: 'Curd/Yogurt', category: 'Dairy', caloriesPer100g: 61, proteinPer100g: 3.5, carbsPer100g: 4.7, fatPer100g: 3.3, vegType: 'Veg' },
    { foodName: 'Cheese (Cheddar)', category: 'Dairy', caloriesPer100g: 403, proteinPer100g: 25, carbsPer100g: 1.3, fatPer100g: 33, vegType: 'Veg' },
    { foodName: 'Buttermilk', category: 'Dairy', caloriesPer100g: 40, proteinPer100g: 3.3, carbsPer100g: 4.8, fatPer100g: 0.9, vegType: 'Veg' },

    // FRUITS
    { foodName: 'Orange', category: 'Fruit', caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1, vegType: 'Veg' },
    { foodName: 'Mango', category: 'Fruit', caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4, vegType: 'Veg' },
    { foodName: 'Papaya', category: 'Fruit', caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 11, fatPer100g: 0.3, vegType: 'Veg' },
    { foodName: 'Watermelon', category: 'Fruit', caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 8, fatPer100g: 0.2, vegType: 'Veg' },
    { foodName: 'Grapes', category: 'Fruit', caloriesPer100g: 69, proteinPer100g: 0.7, carbsPer100g: 18, fatPer100g: 0.2, vegType: 'Veg' },
    { foodName: 'Pineapple', category: 'Fruit', caloriesPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 13, fatPer100g: 0.1, vegType: 'Veg' },
    { foodName: 'Strawberries', category: 'Fruit', caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 8, fatPer100g: 0.3, vegType: 'Veg' },
    { foodName: 'Blueberries', category: 'Fruit', caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatPer100g: 0.3, vegType: 'Veg' },

    // LEGUMES
    { foodName: 'Chickpeas (Cooked)', category: 'Protein', caloriesPer100g: 164, proteinPer100g: 9, carbsPer100g: 27, fatPer100g: 2.6, vegType: 'Veg' },
    { foodName: 'Lentils (Cooked)', category: 'Protein', caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4, vegType: 'Veg' },
    { foodName: 'Kidney Beans (Rajma)', category: 'Protein', caloriesPer100g: 127, proteinPer100g: 8.7, carbsPer100g: 22, fatPer100g: 0.5, vegType: 'Veg' },
    { foodName: 'Black Beans', category: 'Protein', caloriesPer100g: 132, proteinPer100g: 8.9, carbsPer100g: 24, fatPer100g: 0.5, vegType: 'Veg' },
    { foodName: 'Moong Dal (Cooked)', category: 'Protein', caloriesPer100g: 105, proteinPer100g: 7, carbsPer100g: 19, fatPer100g: 0.4, vegType: 'Veg' },

    // SNACKS
    { foodName: 'Dark Chocolate (70%)', category: 'Snack', caloriesPer100g: 600, proteinPer100g: 7.8, carbsPer100g: 46, fatPer100g: 43, vegType: 'Veg' },
    { foodName: 'Protein Bar', category: 'Snack', caloriesPer100g: 350, proteinPer100g: 20, carbsPer100g: 40, fatPer100g: 12, vegType: 'Veg' },
    { foodName: 'Roasted Makhana', category: 'Snack', caloriesPer100g: 347, proteinPer100g: 9.7, carbsPer100g: 77, fatPer100g: 0.1, vegType: 'Veg' },
    { foodName: 'Peanuts (Roasted)', category: 'Snack', caloriesPer100g: 567, proteinPer100g: 26, carbsPer100g: 16, fatPer100g: 49, vegType: 'Veg' },

    // BEVERAGES
    { foodName: 'Black Coffee', category: 'Beverage', caloriesPer100g: 2, proteinPer100g: 0.1, carbsPer100g: 0, fatPer100g: 0, vegType: 'Veg' },
    { foodName: 'Green Tea', category: 'Beverage', caloriesPer100g: 1, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0, vegType: 'Veg' },
    { foodName: 'Coconut Water', category: 'Beverage', caloriesPer100g: 19, proteinPer100g: 0.7, carbsPer100g: 4, fatPer100g: 0.2, vegType: 'Veg' },
    { foodName: 'Orange Juice (Fresh)', category: 'Beverage', caloriesPer100g: 45, proteinPer100g: 0.7, carbsPer100g: 10, fatPer100g: 0.2, vegType: 'Veg' },
];

async function main() {
    console.log(`Seeding ${foods.length} foods to Supabase...`);
    let created = 0;
    let skipped = 0;

    for (const food of foods) {
        // Avoid duplicates by name
        const exists = await prisma.food.findFirst({
            where: { foodName: food.foodName }
        });

        if (!exists) {
            await prisma.food.create({ data: food });
            created++;
        } else {
            skipped++;
        }
    }
    console.log(`Food seeding completed! Created: ${created}, Skipped: ${skipped}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
