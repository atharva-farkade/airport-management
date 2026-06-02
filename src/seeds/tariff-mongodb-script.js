// =====================================================
// MongoDB Script to Insert Tariff Data
// Run this in MongoDB Atlas Shell or MongoDB Compass
// =====================================================

// First, clear existing tariffs (with safety guard)
if (db.getName() !== "asmpDB") {
    throw new Error("Aborting: expected database 'asmpDB', got '" + db.getName() + "'");
}
db.tariffs.deleteMany({});

// Insert all tariffs
db.tariffs.insertMany([
    // ==================== DEFAULT (1.0x) ====================
    { serviceType: "REFUELING", aircraftType: "DEFAULT", baseFee: 3000, ratePerUnit: 85, unit: "liter", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "CATERING", aircraftType: "DEFAULT", baseFee: 4000, ratePerUnit: 200, unit: "meal", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "BAGGAGE_HANDLING", aircraftType: "DEFAULT", baseFee: 1500, ratePerUnit: 30, unit: "item", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "CABIN_CLEANING", aircraftType: "DEFAULT", baseFee: 12000, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "LINE_MAINTENANCE", aircraftType: "DEFAULT", baseFee: 20000, ratePerUnit: 400, unit: "hour", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "WATER_SERVICE", aircraftType: "DEFAULT", baseFee: 2500, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "LAVATORY_SERVICE", aircraftType: "DEFAULT", baseFee: 3500, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "PUSHBACK_TOWING", aircraftType: "DEFAULT", baseFee: 7000, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "GROUND_HANDLING", aircraftType: "DEFAULT", baseFee: 8000, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "FLIGHT_INSPECTION", aircraftType: "DEFAULT", baseFee: 5000, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "BAGGAGE_UNLOADING", aircraftType: "DEFAULT", baseFee: 1500, ratePerUnit: 25, unit: "item", currency: "INR", createdAt: new Date(), updatedAt: new Date() },

    // ==================== ATR-72 (0.6x) ====================
    { serviceType: "REFUELING", aircraftType: "ATR-72", baseFee: 1800, ratePerUnit: 51, unit: "liter", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "CATERING", aircraftType: "ATR-72", baseFee: 2400, ratePerUnit: 120, unit: "meal", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "BAGGAGE_HANDLING", aircraftType: "ATR-72", baseFee: 900, ratePerUnit: 18, unit: "item", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "CABIN_CLEANING", aircraftType: "ATR-72", baseFee: 7200, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "LINE_MAINTENANCE", aircraftType: "ATR-72", baseFee: 12000, ratePerUnit: 240, unit: "hour", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "WATER_SERVICE", aircraftType: "ATR-72", baseFee: 1500, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "LAVATORY_SERVICE", aircraftType: "ATR-72", baseFee: 2100, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "PUSHBACK_TOWING", aircraftType: "ATR-72", baseFee: 4200, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "GROUND_HANDLING", aircraftType: "ATR-72", baseFee: 4800, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "FLIGHT_INSPECTION", aircraftType: "ATR-72", baseFee: 3000, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "BAGGAGE_UNLOADING", aircraftType: "ATR-72", baseFee: 900, ratePerUnit: 15, unit: "item", currency: "INR", createdAt: new Date(), updatedAt: new Date() },

    // ==================== A320 (1.0x) ====================
    { serviceType: "REFUELING", aircraftType: "A320", baseFee: 3000, ratePerUnit: 85, unit: "liter", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "CATERING", aircraftType: "A320", baseFee: 4000, ratePerUnit: 200, unit: "meal", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "BAGGAGE_HANDLING", aircraftType: "A320", baseFee: 1500, ratePerUnit: 30, unit: "item", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "CABIN_CLEANING", aircraftType: "A320", baseFee: 12000, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "LINE_MAINTENANCE", aircraftType: "A320", baseFee: 20000, ratePerUnit: 400, unit: "hour", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "WATER_SERVICE", aircraftType: "A320", baseFee: 2500, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "LAVATORY_SERVICE", aircraftType: "A320", baseFee: 3500, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "PUSHBACK_TOWING", aircraftType: "A320", baseFee: 7000, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "GROUND_HANDLING", aircraftType: "A320", baseFee: 8000, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "FLIGHT_INSPECTION", aircraftType: "A320", baseFee: 5000, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "BAGGAGE_UNLOADING", aircraftType: "A320", baseFee: 1500, ratePerUnit: 25, unit: "item", currency: "INR", createdAt: new Date(), updatedAt: new Date() },

    // ==================== B787 (1.5x) ====================
    { serviceType: "REFUELING", aircraftType: "B787", baseFee: 4500, ratePerUnit: 127.5, unit: "liter", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "CATERING", aircraftType: "B787", baseFee: 6000, ratePerUnit: 300, unit: "meal", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "BAGGAGE_HANDLING", aircraftType: "B787", baseFee: 2250, ratePerUnit: 45, unit: "item", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "CABIN_CLEANING", aircraftType: "B787", baseFee: 18000, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "LINE_MAINTENANCE", aircraftType: "B787", baseFee: 30000, ratePerUnit: 600, unit: "hour", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "WATER_SERVICE", aircraftType: "B787", baseFee: 3750, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "LAVATORY_SERVICE", aircraftType: "B787", baseFee: 5250, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "PUSHBACK_TOWING", aircraftType: "B787", baseFee: 10500, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "GROUND_HANDLING", aircraftType: "B787", baseFee: 12000, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "FLIGHT_INSPECTION", aircraftType: "B787", baseFee: 7500, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "BAGGAGE_UNLOADING", aircraftType: "B787", baseFee: 2250, ratePerUnit: 37.5, unit: "item", currency: "INR", createdAt: new Date(), updatedAt: new Date() },

    // ==================== B777 (1.8x) ====================
    { serviceType: "REFUELING", aircraftType: "B777", baseFee: 5400, ratePerUnit: 153, unit: "liter", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "CATERING", aircraftType: "B777", baseFee: 7200, ratePerUnit: 360, unit: "meal", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "BAGGAGE_HANDLING", aircraftType: "B777", baseFee: 2700, ratePerUnit: 54, unit: "item", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "CABIN_CLEANING", aircraftType: "B777", baseFee: 21600, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "LINE_MAINTENANCE", aircraftType: "B777", baseFee: 36000, ratePerUnit: 720, unit: "hour", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "WATER_SERVICE", aircraftType: "B777", baseFee: 4500, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "LAVATORY_SERVICE", aircraftType: "B777", baseFee: 6300, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "PUSHBACK_TOWING", aircraftType: "B777", baseFee: 12600, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "GROUND_HANDLING", aircraftType: "B777", baseFee: 14400, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "FLIGHT_INSPECTION", aircraftType: "B777", baseFee: 9000, ratePerUnit: 0, unit: "fixed", currency: "INR", createdAt: new Date(), updatedAt: new Date() },
    { serviceType: "BAGGAGE_UNLOADING", aircraftType: "B777", baseFee: 2700, ratePerUnit: 45, unit: "item", currency: "INR", createdAt: new Date(), updatedAt: new Date() }
]);

// Create compound unique index
db.tariffs.createIndex({ serviceType: 1, aircraftType: 1 }, { unique: true });

// Verify insertion
print("✅ Inserted " + db.tariffs.countDocuments() + " tariffs successfully!");
print("\n📊 Count by Aircraft Type:");
db.tariffs.aggregate([
    { $group: { _id: "$aircraftType", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
]).forEach(doc => print("   " + doc._id + ": " + doc.count + " tariffs"));
