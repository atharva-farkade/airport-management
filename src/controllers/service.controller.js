import { ServiceRequest } from "../models/serviceRequest.model.js";
import { airplanes } from "../constants.js";
import asyncHandler from "../utils/asyncHandlers.js";

export const requestServices = async (req, res) => {
  try {
    const { airplaneId, services } = req.body;

    // Check airplane exists
    const plane = airplanes.find(p => p.id === airplaneId);
    if (!plane) {
      return res.status(404).json({ success: false, message: "Airplane not found" });
    }

    // Save new service request
    await ServiceRequest.create({
      airplaneId,
      airlineStaffId: req.user._id,
      requestedServices: services
    });

    return res.status(201).json({
      success: true,
      message: "Services requested successfully"
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Error requesting services" });
  }
};

const grantPermission = asyncHandler(async (req, res) => res.send("Staff route accessed successfully"));
export { grantPermission};

