import mongoose from "mongoose";

const tariffSchema = new mongoose.Schema({
    serviceType: {
        type: String,
        required: true
    },
    aircraftType: {
        type: String,
        required: true,
        enum: ['A320', 'B777', 'B787', 'ATR-72', 'DEFAULT']
    },
    baseFee: {
        type: Number,
        required: true,
        default: 0
    },
    ratePerUnit: {
        type: Number,
        default: 0
    },
    unit: {
        type: String,
        default: 'fixed',
        enum: ['fixed', 'liter', 'hour', 'meal', 'item', 'Kg']
    },
    currency: {
        type: String,
        default: 'INR'
    }
}, { timestamps: true });

// Compound index to ensure unique service+aircraft combinations
tariffSchema.index({ serviceType: 1, aircraftType: 1 }, { unique: true });

export const Tariff = mongoose.model("Tariff", tariffSchema);
