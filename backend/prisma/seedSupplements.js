const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const supplements = [
    // --- PROTEIN ---
    { name: 'Whey Protein Concentrate', category: 'Protein', mainUse: 'Muscle Building & Recovery', benefits: 'Complete protein source, affordable.', whoShouldUse: 'General population, athletes.', bestTime: 'Post-workout or anytime.', notes: 'Contains lactose.' },
    { name: 'Whey Protein Isolate', category: 'Protein', mainUse: 'Muscle Recovery (Fast Absorption)', benefits: 'Higher protein %, lower carb/fat, faster absorption.', whoShouldUse: 'Lactose intolerant, cutting phase.', bestTime: 'Post-workout.', notes: 'More expensive than concentrate.' },
    { name: 'Casein Protein', category: 'Protein', mainUse: 'Prevent Muscle Breakdown (Slow Release)', benefits: 'Digests slowly over 6-8 hours.', whoShouldUse: 'Bodybuilders, fasting individuals.', bestTime: 'Before bed.', notes: 'Thicker texture.' },
    { name: 'Plant Protein (Pea/Rice)', category: 'Protein', mainUse: 'Muscle Recovery (Vegan)', benefits: 'Dairy-free, hypoallergenic.', whoShouldUse: 'Vegans, lactose intolerant.', bestTime: 'Anytime.', notes: 'Check amino acid profile.' },

    // --- MUSCLE BUILDING ---
    { name: 'Creatine Monohydrate', category: 'Muscle Building', mainUse: 'Strength & Power', benefits: 'Increases ATP production, hydration, strength.', whoShouldUse: 'Strength athletes, bodybuilders.', bestTime: 'Pre or Post workout (consistency matters).', notes: 'Drink plenty of water. 5g daily.' },
    { name: 'Creatine HCL', category: 'Muscle Building', mainUse: 'Strength (No Bloat)', benefits: 'High solubility, smaller dose.', whoShouldUse: 'People sensitive to bloating.', bestTime: 'Pre-workout.', notes: 'Less research than Monohydrate.' },
    { name: 'Mass Gainer', category: 'Muscle Building', mainUse: 'Calorie Surplus', benefits: 'Easy calories for weight gain.', whoShouldUse: 'Hardgainers.', bestTime: 'Post-workout or between meals.', notes: 'Often high in sugar.' },
    { name: 'BCAA', category: 'Muscle Building', mainUse: 'Reduce Muscle Soreness', benefits: 'Leucine stimulates synthesis.', whoShouldUse: 'Fasted trainees.', bestTime: 'Intra-workout.', notes: 'Not necessary if protein intake is high.' },
    { name: 'EAA', category: 'Muscle Building', mainUse: 'Muscle Protein Synthesis', benefits: 'Contains all essential amino acids.', whoShouldUse: 'Everyone, especially vegans.', bestTime: 'Intra-workout.', notes: 'Superior to BCAAs.' },
    { name: 'HMB', category: 'Muscle Building', mainUse: 'Anti-Catabolic', benefits: 'Reduces muscle breakdown.', whoShouldUse: 'Beginners, elderly, injured.', bestTime: 'Before workout.', notes: 'Efficacy varies.' },

    // --- ENERGY / PERFORMANCE ---
    { name: 'Pre-Workout Stimulant', category: 'Energy', mainUse: 'Focus & Energy', benefits: 'Boosts alertness and blood flow.', whoShouldUse: 'Those needing energy boost.', bestTime: '30 mins before workout.', notes: 'Watch caffeine tolerance.' },
    { name: 'Caffeine Capsules', category: 'Energy', mainUse: 'Mental Alertness', benefits: 'Standardized dose of energy.', whoShouldUse: 'Coffee haters.', bestTime: 'Pre-workout.', notes: 'Can cause jitters.' },
    { name: 'Beta Alanine', category: 'Energy', mainUse: 'Endurance (Buffer Lactic Acid)', benefits: 'Delays fatigue, "tingles".', whoShouldUse: 'High rep/endurance athletes.', bestTime: 'Pre-workout.', notes: 'Causes harmless tingling (paresthesia).' },
    { name: 'Citrulline Malate', category: 'Energy', mainUse: 'Pump & Blood Flow', benefits: 'Increases nitric oxide, endurance.', whoShouldUse: 'Bodybuilders.', bestTime: 'Pre-workout (6-8g).', notes: 'Sour taste.' },
    { name: 'Electrolytes', category: 'Energy', mainUse: 'Hydration', benefits: 'Replenishes salts lost in sweat.', whoShouldUse: 'Endurance athletes, heavy sweaters.', bestTime: 'Intra/Post workout.', notes: 'Check sugar content.' },

    // --- FAT LOSS ---
    { name: 'L-Carnitine', category: 'Fat Loss', mainUse: 'Fat Metabolism', benefits: 'Helps transport fatty acids.', whoShouldUse: 'Endurance, cutting.', bestTime: 'Pre-workout.', notes: 'Injectable more effective than oral.' },
    { name: 'CLA', category: 'Fat Loss', mainUse: 'Body Composition', benefits: 'May reduce fat storage.', whoShouldUse: 'General weight loss.', bestTime: 'With meals.', notes: 'Minor effects.' },
    { name: 'Green Tea Extract (EGCG)', category: 'Fat Loss', mainUse: 'Metabolic Boost', benefits: 'Antioxidant, mild thermogenic.', whoShouldUse: 'Everyone.', bestTime: 'Morning.', notes: 'Contains caffeine.' },
    { name: 'Fat Burner Complex', category: 'Fat Loss', mainUse: 'Metabolism & Appetite Suppression', benefits: 'Stimulant effect.', whoShouldUse: 'Short term cutting.', bestTime: 'Morning/Pre-workout.', notes: 'Watch heart rate.' },
    { name: 'Apple Cider Vinegar', category: 'Fat Loss', mainUse: 'Blood Sugar Control', benefits: 'Insulin sensitivity.', whoShouldUse: 'Pre-diabetic, general health.', bestTime: 'Before meals.', notes: 'Acidic for teeth.' },

    // --- HEALTH ---
    { name: 'Multivitamin', category: 'Health', mainUse: 'Nutritional Insurance', benefits: 'Fills micronutrient gaps.', whoShouldUse: 'Everyone.', bestTime: 'Morning with food.', notes: 'Quality matters.' },
    { name: 'Vitamin D3', category: 'Health', mainUse: 'Bone & Immune Health', benefits: 'Hormone precursor, mood.', whoShouldUse: 'Most people (sun lack).', bestTime: 'Morning with fat.', notes: 'Pair with K2.' },
    { name: 'Vitamin C', category: 'Health', mainUse: 'Immunity', benefits: 'Antioxidant, collagen synthesis.', whoShouldUse: 'Stressed immune systems.', bestTime: 'Anytime.', notes: 'Water soluble.' },
    { name: 'Vitamin B Complex', category: 'Health', mainUse: 'Energy Metabolism', benefits: 'Cellular energy, nerve health.', whoShouldUse: 'Vegans, fatigued.', bestTime: 'Morning.', notes: 'Bright yellow urine.' },
    { name: 'Zinc', category: 'Health', mainUse: 'Testosterone & Immunity', benefits: 'Hormone balance.', whoShouldUse: 'Men, athletes.', bestTime: 'Before bed.', notes: 'Can cause nausea on empty stomach.' },
    { name: 'Magnesium', category: 'Health', mainUse: 'Relaxation & Nerve Function', benefits: 'Sleep, cramp prevention.', whoShouldUse: 'Everyone.', bestTime: 'Before bed.', notes: 'Glycinate form is best for sleep.' },
    { name: 'Calcium', category: 'Health', mainUse: 'Bone Health', benefits: 'Skeletal strength.', whoShouldUse: 'Elderly, vegans.', bestTime: 'With meals.', notes: 'Don\'t take with Iron.' },
    { name: 'Iron', category: 'Health', mainUse: 'Blood Oxygen Transport', benefits: 'Prevents anemia.', whoShouldUse: 'Females, vegans.', bestTime: 'With Vitamin C.', notes: 'Toxic in excess.' },
    { name: 'Omega-3 Fish Oil', category: 'Health', mainUse: 'Heart & Brain Health', benefits: 'Anti-inflammatory.', whoShouldUse: 'Everyone.', bestTime: 'With meals.', notes: 'Check EPA/DHA levels.' },
    { name: 'Probiotics', category: 'Health', mainUse: 'Gut Health', benefits: 'microbiome balance.', whoShouldUse: 'Digestive issues.', bestTime: 'Empty stomach.', notes: 'Keep refrigerated.' },
    { name: 'Digestive Enzymes', category: 'Health', mainUse: 'Digestion Aid', benefits: 'Breaks down food.', whoShouldUse: 'Bloating, big meals.', bestTime: 'With meals.', notes: '-' },

    // --- JOINT / RECOVERY ---
    { name: 'Glucosamine', category: 'Joint', mainUse: 'Joint Health', benefits: 'Cartilage support.', whoShouldUse: 'Runners, elderly.', bestTime: 'Daily.', notes: 'Shellfish allergy warning.' },
    { name: 'Collagen Peptides', category: 'Joint', mainUse: 'Skin & Joint Elasticity', benefits: 'Tendon health, skin.', whoShouldUse: 'Everyone > 30.', bestTime: 'Anytime.', notes: 'Not a complete protein.' },
    { name: 'Turmeric Curcumin', category: 'Joint', mainUse: 'Anti-Inflammation', benefits: 'Reduces systemic inflammation.', whoShouldUse: 'Joint pain.', bestTime: 'With black pepper.', notes: 'Natural painkiller.' },
    { name: 'Ashwagandha', category: 'Recovery', mainUse: 'Stress/Cortisol Reduction', benefits: 'Adaptogen, sleep, focus.', whoShouldUse: 'High stress.', bestTime: 'Evening/Bed.', notes: 'Cycle usage.' },

    // --- HORMONE ---
    { name: 'Tribulus', category: 'Hormone', mainUse: 'Libido', benefits: 'Sexual health.', whoShouldUse: 'Men.', bestTime: 'Daily.', notes: 'Weak evidence for muscle.' },
    { name: 'Fenugreek', category: 'Hormone', mainUse: 'Libido & Glucose', benefits: 'Insulin sensitivity.', whoShouldUse: 'Men.', bestTime: 'Daily.', notes: 'Maple syrup smell.' },
    { name: 'Tongkat Ali', category: 'Hormone', mainUse: 'Testosterone Support', benefits: 'Stress reduction, libido.', whoShouldUse: 'Men > 30.', bestTime: 'Morning.', notes: 'Standardized extract needed.' },

    // --- SLEEP ---
    { name: 'Melatonin', category: 'Sleep', mainUse: 'Sleep Onset', benefits: 'Circadian rhythm.', whoShouldUse: 'Insomniacs, travelers.', bestTime: '30m before bed.', notes: 'Use low dose (1-3mg).' },
    { name: 'ZMA', category: 'Sleep', mainUse: 'Deep Sleep', benefits: 'Zinc + Magnesium.', whoShouldUse: 'Athletes.', bestTime: 'Before bed.', notes: 'Avoid calcium with it.' },

    // --- OTHERS ---
    { name: 'Elderberry', category: 'Immunity', mainUse: 'Cold Defense', benefits: 'Anti-viral properties.', whoShouldUse: 'Sick individuals.', bestTime: 'Onset of symptoms.', notes: '-' },
    { name: 'Milk Thistle', category: 'Liver', mainUse: 'Liver Support', benefits: 'Detoxification.', whoShouldUse: 'During cycles.', bestTime: 'Daily.', notes: '-' },
    { name: 'NAC', category: 'Liver', mainUse: 'Glutathione Precursor', benefits: 'Potsent antioxidant.', whoShouldUse: 'General health.', bestTime: 'Daily.', notes: 'Sulfur smell.' },
    { name: 'Biotin', category: 'Skin/Hair', mainUse: 'Hair/Nail Health', benefits: 'Keratin infrastructure.', whoShouldUse: 'Beauty focus.', bestTime: 'Daily.', notes: 'Can affect thyroid labs.' },
    { name: 'Fiber Powder', category: 'General', mainUse: 'Digestion', benefits: 'Regularity, satiety.', whoShouldUse: 'Low veg intake.', bestTime: 'Anytime.', notes: 'Drink water.' },
    { name: 'Adaptogen Blend', category: 'General', mainUse: 'Stress Balance', benefits: 'Homeostasis.', whoShouldUse: 'Stressed.', bestTime: 'Morning.', notes: 'Rhodiola, Holy Basil, etc.' },
];

async function main() {
    console.log(`Clearing old supplements...`);
    try {
        await prisma.supplement.deleteMany({
            where: { createdByTrainer: null }
        });
    } catch (e) {
        console.log('Table might vary, createdByTrainer null delete attempted.');
    }

    console.log(`Seeding ${supplements.length} supplements...`);

    for (const s of supplements) {
        await prisma.supplement.create({
            data: s
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
