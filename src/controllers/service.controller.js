import mongoose from "mongoose";
import { ServiceRequest } from "../models/serviceRequest.model.js";
import { FlightDetails } from "../models/flightDetails.model.js";
import asyncHandler from "../utils/asyncHandlers.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { TurnaroundManager } from "../utils/TurnaroundManager.js";
import { BillingService } from "../utils/BillingService.js";
import { ServiceRequestStatus, ServiceTypes } from "../constants.js";

// AIRLINE STAFF: Request services for a flight
export const requestServices = asyncHandler(async (req, res) => {
  const { flightId, services } = req.body; // services: [{ serviceType, quantityEstimate }]

  // Validate object ID
  if (!mongoose.Types.ObjectId.isValid(flightId)) {
    throw new ApiError("Invalid flight ID", 400);
  }

  // Find flight by _id
  const flight = await FlightDetails.findById(flightId);
  if (!flight) {
    throw new ApiError("Flight not found", 404);
  }

  // Create individual service requests
  const validTypes = Object.values(ServiceTypes);
  for (const service of services) {
    if (!validTypes.includes(service.serviceType)) {
      throw new ApiError(`Invalid service type: '${service.serviceType}'`, 400);
    }
  }

  // Check for duplicate service types in this request
  const requestedTypes = services.map(s => s.serviceType);
  if (new Set(requestedTypes).size !== requestedTypes.length) {
    throw new ApiError("Duplicate service types in request", 400);
  }

  // Check for already-requested services on this flight
  const existingServices = await ServiceRequest.find({ flightId: flight._id });
  const existingTypes = existingServices.map(s => s.serviceType);
  const duplicates = requestedTypes.filter(t => existingTypes.includes(t));
  if (duplicates.length > 0) {
    throw new ApiError(`Services already requested for this flight: ${duplicates.join(', ')}`, 409);
  }

  const createdRequests = [];
  for (const service of services) {
    const serviceRequest = await ServiceRequest.create({
      flightId: flight._id,
      flightNumber: flight.flightNumber,
      serviceType: service.serviceType,
      requestedBy: req.user._id,
      quantityUsed: service.quantityEstimate || 0,
      unit: service.unit || 'fixed'
    });
    createdRequests.push(serviceRequest);
  }

  // Emit socket event to notify vendors
  const io = req.app.get("io");
  if (io) {
    io.emit("services_requested", {
      flightId: flight._id,
      flightNumber: flight.flightNumber,
      services: createdRequests.map(sr => ({
        serviceId: sr.serviceId,
        serviceType: sr.serviceType
      }))
    });
  }

  return res.status(201).json(
    new ApiResponse(201, createdRequests, "Service requests created successfully")
  );
});

// VENDOR: Get tasks assigned to them based on specialization
export const getMyTasks = asyncHandler(async (req, res) => {
  const vendor = req.user;

  // Find service requests matching vendor's specialization
  const tasks = await ServiceRequest.find({
    serviceType: vendor.specialization,
    status: { $in: [ServiceRequestStatus.PENDING, ServiceRequestStatus.IN_PROGRESS] }
  })
    .populate('flightId', 'flightNumber airlineName sta std turnaroundStatus')
    .populate('requestedBy', 'username airline')
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, tasks, "Tasks retrieved successfully")
  );
});

// VENDOR: Claim/Start a service
export const startService = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError("Service request not found", 404);
  }

  // Check if vendor specialization matches
  if (serviceRequest.serviceType !== req.user.specialization) {
    throw new ApiError("You are not authorized to handle this service type", 403);
  }

  // Check if already claimed
  if (serviceRequest.status !== ServiceRequestStatus.PENDING) {
    throw new ApiError("Service already claimed by another vendor", 409);
  }

  serviceRequest.assignedVendor = req.user._id;
  serviceRequest.status = ServiceRequestStatus.IN_PROGRESS;
  serviceRequest.startTime = new Date();
  await serviceRequest.save();

  // Update turnaround status
  const io = req.app.get("io");
  await TurnaroundManager.updateTurnaroundStatus(serviceRequest.flightId, io);

  if (io) {
    io.emit("service_started", {
      serviceId: serviceRequest.serviceId,
      serviceType: serviceRequest.serviceType,
      vendor: req.user.username
    });
  }

  return res.status(200).json(
    new ApiResponse(200, serviceRequest, "Service started successfully")
  );
});

// VENDOR: Update service progress and mark as completed
export const updateServiceProgress = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const { status, quantityUsed } = req.body;

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError("Service request not found", 404);
  }

  // Verify vendor is assigned to this task
  if (serviceRequest.assignedVendor?.toString() !== req.user._id.toString()) {
    throw new ApiError("You are not assigned to this service", 403);
  }

  // Update status and quantity
  if (status) {
    if (status !== ServiceRequestStatus.COMPLETED) {
      throw new ApiError("Can only transition to 'completed' from in_progress", 400);
    }
    if (serviceRequest.status !== ServiceRequestStatus.IN_PROGRESS) {
      throw new ApiError("Service must be in_progress to mark as completed", 400);
    }
    serviceRequest.status = status;
  }
  if (quantityUsed !== undefined) {
    serviceRequest.quantityUsed = quantityUsed;
  }

  // If completed, set end time
  if (status === ServiceRequestStatus.COMPLETED) {
    serviceRequest.endTime = new Date();
  }

  await serviceRequest.save();

  // Update turnaround status
  const io = req.app.get("io");
  await TurnaroundManager.updateTurnaroundStatus(serviceRequest.flightId, io);

  if (io) {
    io.emit("service_progress_update", {
      serviceId: serviceRequest.serviceId,
      status: serviceRequest.status,
      quantityUsed: serviceRequest.quantityUsed
    });
  }

  return res.status(200).json(
    new ApiResponse(200, serviceRequest, "Service updated successfully")
  );
});

// AIRLINE STAFF: Verify service and trigger billing
export const verifyService = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError("Service request not found", 404);
  }

  // Only completed services can be verified
  if (serviceRequest.status !== ServiceRequestStatus.COMPLETED) {
    throw new ApiError("Only completed services can be verified", 400);
  }

  // Get flight details to get aircraft type
  const flight = await FlightDetails.findById(serviceRequest.flightId);
  if (!flight) {
    throw new ApiError("Flight not found", 404);
  }

  // Calculate cost using BillingService with aircraft type
  const { cost } = await BillingService.calculateCost(
    serviceRequest.serviceType,
    serviceRequest.quantityUsed,
    flight.aircraftType || 'DEFAULT'
  );

  serviceRequest.calculatedCost = cost;
  serviceRequest.status = ServiceRequestStatus.VERIFIED;
  serviceRequest.verifiedAt = new Date();
  await serviceRequest.save();

  // Add to invoice
  await BillingService.addToInvoice(serviceRequest.flightId, serviceRequest._id);

  // Update turnaround status
  const io = req.app.get("io");
  await TurnaroundManager.updateTurnaroundStatus(serviceRequest.flightId, io);

  if (io) {
    io.emit("service_verified", {
      serviceId: serviceRequest.serviceId,
      cost: cost
    });
  }

  return res.status(200).json(
    new ApiResponse(200, serviceRequest, "Service verified and billed successfully")
  );
});

// Get all service requests for a flight
export const getFlightServices = asyncHandler(async (req, res) => {
  const { flightId } = req.params;

  const services = await ServiceRequest.find({ flightId })
    .populate('requestedBy', 'username')
    .populate('assignedVendor', 'username specialization');

  return res.status(200).json(
    new ApiResponse(200, services, "Flight services retrieved successfully")
  );
});

const grantPermission = asyncHandler(async (req, res) =>
  res.send("Staff route accessed successfully")
);

export { grantPermission };
