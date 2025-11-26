import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema({
  airplaneId: { type: String, required: true },
  airlineStaffId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  requestedServices: {
    type: [String], 
    required: true
  },

  status: {
    type: String,
    default: "requested" 
  },
  //create a service id here so that only for 1 service id there should not be multiple requests
  

  createdAt: { type: Date, default: Date.now }
});

export const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);
