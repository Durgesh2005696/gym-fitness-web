const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();
const prisma = new PrismaClient();

const foods = [
    // PROTEIN
    { foodName: 'Chicken Breast (Raw)', category: 'Protein', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, vegType: 'Non-Veg', potassium: 256, magnesium: 29 },
    { foodName: 'Salmon (Raw)', category: 'Protein', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, vegType: 'Non-Veg', vitaminD: 100, vitaminB12: 3.2, potassium: 363 },
    { foodName: 'Egg (Whole, Raw)', category: 'Protein', caloriesPer100g: 143, proteinPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5, vegType: 'Non-Veg', vitaminA: 540, vitaminD: 82, calcium: 56 },
    { foodName: 'Egg White (Raw)', category: 'Protein', caloriesPer100g: 52, proteinPer100g: 10.9, carbsPer100g: 0.7, fatPer100g: 0.2, vegType: 'Non-Veg', potassium: 163, sodium: 166 },
    { foodName: 'Paneer (Cottage Cheese)', category: 'Dairy', caloriesPer100g: 265, proteinPer100g: 18, carbsPer100g: 1.2, fatPer100g: 20, vegType: 'Veg', calcium: 400, vitaminA: 150 },
    { foodName: 'Tofu (Firm)', category: 'Protein', caloriesPer100g: 144, proteinPer100g: 15, carbsPer100g: 3.9, fatPer100g: 8, vegType: 'Veg', calcium: 350, iron: 5.4 },
    { foodName: 'Soya Chunks', category: 'Protein', caloriesPer100g: 345, proteinPer100g: 52, carbsPer100g: 33, fatPer100g: 0.5, fiberPer100g: 13, vegType: 'Veg', calcium: 350, iron: 20 },
    { foodName: 'Greek Yogurt (Plain, Low Fat)', category: 'Dairy', caloriesPer100g: 73, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 1.9, vegType: 'Veg', calcium: 110, vitaminB12: 0.7 },
    { foodName: 'Whey Protein Isolate', category: 'Protein', caloriesPer100g: 370, proteinPer100g: 90, carbsPer100g: 1, fatPer100g: 1, vegType: 'Veg', calcium: 400 },

    // LEGUMES
    { foodName: 'Chickpeas (Raw)', category: 'Grains', caloriesPer100g: 378, proteinPer100g: 20, carbsPer100g: 63, fatPer100g: 6, fiberPer100g: 12, vegType: 'Veg', iron: 6.2, magnesium: 115, potassium: 875 },
    { foodName: 'Masoor Dal (Red, Raw)', category: 'Grains', caloriesPer100g: 343, proteinPer100g: 24, carbsPer100g: 60, fatPer100g: 1, fiberPer100g: 10, vegType: 'Veg', iron: 7, potassium: 955 },
    { foodName: 'Moong Dal (Yellow, Raw)', category: 'Grains', caloriesPer100g: 347, proteinPer100g: 24, carbsPer100g: 63, fatPer100g: 1.2, fiberPer100g: 16, vegType: 'Veg', potassium: 1246, magnesium: 189 },
    { foodName: 'Kidney Beans (Rajma, Raw)', category: 'Grains', caloriesPer100g: 333, proteinPer100g: 24, carbsPer100g: 60, fatPer100g: 0.8, fiberPer100g: 25, vegType: 'Veg', iron: 8.2, potassium: 1406 },

    // GRAINS
    { foodName: 'Oats (Rolled, Raw)', category: 'Grains', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatPer100g: 6.9, fiberPer100g: 10.6, vegType: 'Veg', iron: 4.7, magnesium: 177 },
    { foodName: 'White Rice (Raw)', category: 'Grains', caloriesPer100g: 365, proteinPer100g: 7, carbsPer100g: 80, fatPer100g: 0.7, fiberPer100g: 1.3, vegType: 'Veg', iron: 0.8 },
    { foodName: 'Basmati Rice (Raw)', category: 'Grains', caloriesPer100g: 350, proteinPer100g: 8, carbsPer100g: 77, fatPer100g: 0.5, fiberPer100g: 1, vegType: 'Veg' },
    { foodName: 'Brown Rice (Raw)', category: 'Grains', caloriesPer100g: 370, proteinPer100g: 7.9, carbsPer100g: 77, fatPer100g: 2.9, fiberPer100g: 3.5, vegType: 'Veg', magnesium: 143 },
    { foodName: 'Quinoa (Raw)', category: 'Grains', caloriesPer100g: 368, proteinPer100g: 14, carbsPer100g: 64, fatPer100g: 6, fiberPer100g: 7, vegType: 'Veg', iron: 4.6, magnesium: 197 },
    { foodName: 'Whole Wheat Flour (Atta)', category: 'Grains', caloriesPer100g: 340, proteinPer100g: 13, carbsPer100g: 72, fatPer100g: 2.5, fiberPer100g: 11, vegType: 'Veg', iron: 3.9, magnesium: 138 },
    { foodName: 'Sweet Potato (Raw)', category: 'Vegetable', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, fiberPer100g: 3, vegType: 'Veg', vitaminA: 14187, potassium: 337 },
    { foodName: 'Potato (Raw)', category: 'Vegetable', caloriesPer100g: 77, proteinPer100g: 2, carbsPer100g: 17, fatPer100g: 0.1, fiberPer100g: 2.2, vegType: 'Veg', potassium: 421, vitaminC: 19 },

    // FRUITS
    { foodName: 'Banana', category: 'Fruit', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3, fiberPer100g: 2.6, vegType: 'Veg', potassium: 358, vitaminB6: 0.4 },
    { foodName: 'Apple (With Skin)', category: 'Fruit', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, fiberPer100g: 2.4, vegType: 'Veg', potassium: 107, vitaminC: 4.6 },
    { foodName: 'Orange', category: 'Fruit', caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1, fiberPer100g: 2.4, vegType: 'Veg', vitaminC: 53.2, calcium: 40 },
    { foodName: 'Blueberries', category: 'Fruit', caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatPer100g: 0.3, fiberPer100g: 2.4, vegType: 'Veg', vitaminC: 9.7 },
    { foodName: 'Papaya', category: 'Fruit', caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 11, fatPer100g: 0.3, fiberPer100g: 1.7, vegType: 'Veg', vitaminA: 950, vitaminC: 60 },
    { foodName: 'Watermelon', category: 'Fruit', caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 8, fatPer100g: 0.2, fiberPer100g: 0.4, vegType: 'Veg', vitaminA: 569, vitaminC: 8.1 },

    // VEGGIES
    { foodName: 'Spinach (Raw)', category: 'Vegetable', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 2.2, vegType: 'Veg', iron: 2.7, vitaminA: 9377, magnesium: 79 },
    { foodName: 'Broccoli (Raw)', category: 'Vegetable', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, fiberPer100g: 2.6, vegType: 'Veg', vitaminC: 89, calcium: 47 },
    { foodName: 'Carrot (Raw)', category: 'Vegetable', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2, fiberPer100g: 2.8, vegType: 'Veg', vitaminA: 16706, potassium: 320 },
    { foodName: 'Cucumber', category: 'Vegetable', caloriesPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1, fiberPer100g: 0.5, vegType: 'Veg', potassium: 147 },
    { foodName: 'Tomato', category: 'Vegetable', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, fiberPer100g: 1.2, vegType: 'Veg', vitaminC: 13, potassium: 237 },

    // FATS / NUTS / SEEDS
    { foodName: 'Almonds (Raw)', category: 'Nuts', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 49, fiberPer100g: 12.5, vegType: 'Veg', calcium: 269, magnesium: 270, vitaminE: 25.6 },
    { foodName: 'Walnuts (Raw)', category: 'Nuts', caloriesPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatPer100g: 65, fiberPer100g: 6.7, vegType: 'Veg', magnesium: 158 },
    { foodName: 'Chia Seeds', category: 'Seeds', caloriesPer100g: 486, proteinPer100g: 17, carbsPer100g: 42, fatPer100g: 31, fiberPer100g: 34, vegType: 'Veg', calcium: 631, magnesium: 335, iron: 7.7 },
    { foodName: 'Flax Seeds', category: 'Seeds', caloriesPer100g: 534, proteinPer100g: 18, carbsPer100g: 29, fatPer100g: 42, fiberPer100g: 27, vegType: 'Veg', magnesium: 392, potassium: 813 },
    { foodName: 'Olive Oil', category: 'Fat', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, vegType: 'Veg', vitaminE: 14 },
    { foodName: 'Peanut Butter', category: 'Nuts', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, fiberPer100g: 6, vegType: 'Veg', magnesium: 154, potassium: 649 },

    // MISC
    { foodName: 'Milk (Whole)', category: 'Dairy', caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3, vegType: 'Veg', calcium: 113, vitaminD: 1.3 },
    { foodName: 'Dark Chocolate (70-85%)', category: 'Snack', caloriesPer100g: 598, proteinPer100g: 7.8, carbsPer100g: 46, fatPer100g: 43, fiberPer100g: 11, vegType: 'Veg', iron: 11.9, magnesium: 228 }
];

async function main() {
    console.log(`Start seeding ${foods.length} items...`);

    // Optional: Clear existing System foods to prevent dupes (where createdByTrainer is null)
    await prisma.food.deleteMany({
        where: { createdByTrainer: null }
    });

    for (const food of foods) {
        await prisma.food.create({
            data: food
        });
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
