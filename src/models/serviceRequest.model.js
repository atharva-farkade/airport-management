import mongoose from "mongoose";
import { Counter } from "./counter.model.js";

const serviceRequestSchema = new mongoose.Schema(
  {
    flightId: {
      type: String,
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

    services: [
      {
        serviceType: {
          type: String,
          enum: [
            "REFUELING",
            "CABIN_CLEANING",
            "GROUND_HANDLING",
            "PUSHBACK",
            "CATERING",
            "FLIGHT_INSPECTION",
            "BAGGAGE_UNLOADING",
            "WATER_SERVICE",
            "LAVATORY_SERVICE"
          ],
          required: true
        },

        progress: {
          type: Number,
          enum: [0, 25, 50, 75, 100],
          default: 0
        },

        status: {
          type: String,
          enum: ["pending", "in_progress", "completed"],
          default: "pending"
        }
      }
    ],

    //fetched from JWT
    airlineStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    overallStatus: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending"
    }
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
