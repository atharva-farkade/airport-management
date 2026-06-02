import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Aircraft types with their multipliers
const aircraftMultipliers = {
    "DEFAULT": 1.0,
    "ATR-72": 0.6,   // Regional turboprop - 40% discount
    "A320": 1.0,     // Narrow-body baseline
    "B787": 1.5,     // Wide-body - 50% premium
    "B777": 1.8      // Wide-body large - 80% premium
};

// Base tariffs
const baseTariffs = {
    REFUELING: { baseFee: 3000, ratePerUnit: 85, unit: "liter" },
    CATERING: { baseFee: 4000, ratePerUnit: 200, unit: "meal" },
    BAGGAGE_HANDLING: { baseFee: 1500, ratePerUnit: 30, unit: "item" },
    CABIN_CLEANING: { baseFee: 12000, ratePerUnit: 0, unit: "fixed" },
    LINE_MAINTENANCE: { baseFee: 20000, ratePerUnit: 400, unit: "hour" },
    WATER_SERVICE: { baseFee: 2500, ratePerUnit: 0, unit: "fixed" },
    LAVATORY_SERVICE: { baseFee: 3500, ratePerUnit: 0, unit: "fixed" },
    PUSHBACK_TOWING: { baseFee: 7000, ratePerUnit: 0, unit: "fixed" },
    GROUND_HANDLING: { baseFee: 8000, ratePerUnit: 0, unit: "fixed" },
    FLIGHT_INSPECTION: { baseFee: 5000, ratePerUnit: 0, unit: "fixed" },
    BAGGAGE_UNLOADING: { baseFee: 1500, ratePerUnit: 25, unit: "item" }
};

const generateTariffs = () => {
    const tariffs = [];

    for (const aircraftType of Object.keys(aircraftMultipliers)) {
        const multiplier = aircraftMultipliers[aircraftType];

        for (const [serviceType, base] of Object.entries(baseTariffs)) {
            tariffs.push({
                serviceType,
                aircraftType,
                baseFee: Math.round(base.baseFee * multiplier),
                ratePerUnit: Math.round(base.ratePerUnit * multiplier * 100) / 100,
                unit: base.unit,
                currency: "INR"
            });
        }
    }

    return tariffs;
};

const seedTariffs = async () => {
    try {
        console.log("🔌 Connecting to MongoDB Atlas...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB Atlas");

        // Drop the entire tariffs collection to clear old indexes
        try {
            await mongoose.connection.db.collection('tariffs').drop();
            console.log("🗑️  Dropped tariffs collection (including old indexes)");
        } catch (e) {
            console.log("ℹ️  No existing tariffs collection to drop");
        }

        // Define the schema inline to avoid model caching issues
        const tariffSchema = new mongoose.Schema({
            serviceType: { type: String, required: true },
            aircraftType: { type: String, required: true, enum: ['A320', 'B777', 'B787', 'ATR-72', 'DEFAULT'] },
            baseFee: { type: Number, required: true, default: 0 },
            ratePerUnit: { type: Number, default: 0 },
            unit: { type: String, default: 'fixed', enum: ['fixed', 'liter', 'hour', 'meal', 'item', 'Kg'] },
            currency: { type: String, default: 'INR' }
        }, { timestamps: true });

        // Create compound index
        tariffSchema.index({ serviceType: 1, aircraftType: 1 }, { unique: true });

        // Use a fresh model name to avoid caching issues
        const TariffModel = mongoose.models.Tariff || mongoose.model('Tariff', tariffSchema);

        // Generate tariffs
        const tariffs = generateTariffs();

        // Insert directly using collection
        const result = await mongoose.connection.db.collection('tariffs').insertMany(tariffs);

        console.log(`\n✅ Seeded ${result.insertedCount} tariffs successfully!\n`);

        // Display summary
        console.log("📊 Tariff Summary by Aircraft Type:");
        console.log("═══════════════════════════════════════════════════════════════");

        for (const aircraftType of Object.keys(aircraftMultipliers)) {
            const multiplier = aircraftMultipliers[aircraftType];
            console.log(`\n🛩️  ${aircraftType} (${multiplier}x multiplier):`);

            const aircraftTariffs = tariffs.filter(t => t.aircraftType === aircraftType);
            for (const t of aircraftTariffs.slice(0, 3)) {
                console.log(`   ${t.serviceType.padEnd(20)} Base: ₹${t.baseFee.toString().padStart(6)} | Rate: ₹${t.ratePerUnit}/${t.unit}`);
            }
            console.log(`   ... and ${aircraftTariffs.length - 3} more services`);
        }

        console.log("\n═══════════════════════════════════════════════════════════════");
        console.log("\n🎉 All tariffs inserted into MongoDB Atlas successfully!");

        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding tariffs:", err.message);
        process.exit(1);
    }
};

seedTariffs();
