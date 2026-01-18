import mongoose from "mongoose";
import { ServiceRequest } from "../models/serviceRequest.model.js";
import { FlightDetails } from "../models/flightDetails.model.js";
import asyncHandler from "../utils/asyncHandlers.js";

export const requestServices = asyncHandler(async (req, res) => {
  const { flightId, flightNumber, services } = req.body;

  // Validate object ID
  if (!mongoose.Types.ObjectId.isValid(flightId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid flight ID"
    });
  }

  // Find flight by _id
  const flight = await FlightDetails.findById(flightId);

  if (!flight) {
    return res.status(404).json({
      success: false,
      message: "Flight not found"
    });
  }

  const normalizedServices = [...new Set(services)].map(serviceType => ({
    serviceType: serviceType.toUpperCase()
  }));

  const serviceRequest = await ServiceRequest.create({
    flightId: flight._id, 
    flightNumber: flight.flightNumber,
    airlineStaffId: req.user._id,
    services: normalizedServices
  });

  return res.status(201).json({
    success: true,
    message: "Service request created successfully",
    data: {
      serviceId: serviceRequest.serviceId,
      flightId: serviceRequest.flightId,
      flightNumber: serviceRequest.flightNumber,
      services: serviceRequest.services
    }
  });
});

const grantPermission = asyncHandler(async (req, res) =>
  res.send("Staff route accessed successfully")
);

export { grantPermission };
