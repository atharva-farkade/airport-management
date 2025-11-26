import mongoose, { Schema } from 'mongoose';

const flightServiceSchema = new mongoose.Schema({
  // Flight Identification
  flightNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    //example: "AI-441", "6E-2173", "UK-878"
  },
  aircraftRegistration: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    match: [/^VT-[A-Z]{3}$/, 'Invalid registration (e.g., VT-ACU)'],
    //example: "VT-ACU"
  },
  airlineName: {
    type: String,
    required: true,
    trim: true
  },
  aircraftType: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
   // example: "B737", "A320", "B777", "A321", "ATR72"
  },

  // Route & Schedule
  origin: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
   // example: "DEL", "BOM", "BLR"
  },
  destination: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  sta: { // Scheduled Time of Arrival
    type: Date,
    required: true
  },
  std: { // Scheduled Time of Departure (next flight or turnaround)
    type: Date,
    required: true
  },
  eta: { // Estimated Time of Arrival (optional – can be updated later)
    type: Date
  },
  etd: { // Estimated Time of Departure
    type: Date
  },

})

export const FlightDetails = mongoose.model('FlightDetails', flightServiceSchema);