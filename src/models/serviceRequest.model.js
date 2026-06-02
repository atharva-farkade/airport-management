import mongoose from "mongoose";
import { Counter } from "./counter.model.js";
import { ServiceRequestStatus } from "../constants.js";

const serviceRequestSchema = new mongoose.Schema(
  {
    flightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FlightDetails",
      required: true
    },

    flightNumber: {
      type: String,
      required: true
    },

    serviceId: {
      type: String,
      unique: true,
      index: true
    },

    serviceType: {
      type: String,
      required: true
    },

    // Who requested this service?
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Which vendor is assigned/handling this?
    assignedVendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    status: {
      type: String,
      enum: Object.values(ServiceRequestStatus),
      default: ServiceRequestStatus.PENDING
    },

    // Quantity tracking for billing (e.g., 5000 liters, 150 meals)
    quantityUsed: {
      type: Number,
      default: 0
    },

    unit: {
      type: String,
      enum: ['fixed', 'Kg', 'hour', 'meal', 'item'],
      default: 'fixed'
    },

    // Cost snapshot (locked when verified)
    calculatedCost: {
      type: Number,
      default: 0
    },

    // Timing
    startTime: Date,
    endTime: Date,
    verifiedAt: Date
  },
  { timestamps: true }
);

serviceRequestSchema.pre("save", async function (next) {
  if (this.serviceId) return next();

  const counter = await Counter.findOneAndUpdate(
    { name: "service_request" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.serviceId = `SRV-${String(counter.seq).padStart(6, "0")}`;
  next();
});

export const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);
