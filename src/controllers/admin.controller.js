import asyncHandler from '../utils/asyncHandlers.js';
import { FlightDetails } from '../models/flightDetails.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { TurnaroundManager } from '../utils/TurnaroundManager.js';
import { TurnaroundStatus, UserRoles } from '../constants.js';

// Admin: Create a new user
const createUser = asyncHandler(async (req, res) => {
  const { username, email, password, role, gender, number, airline, specialization } = req.body;

  if ([username, email, password, number].some(f => !f?.trim())) {
    throw new ApiError("Username, email, password, and phone number are required", 400);
  }

  const validRoles = Object.values(UserRoles);
  if (!role || !validRoles.includes(role)) {
    throw new ApiError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
  }

  if (role === UserRoles.VENDOR && !specialization) {
    throw new ApiError("Specialization is required for vendor role", 400);
  }
  if (role === UserRoles.AIRLINE_STAFF && !airline) {
    throw new ApiError("Airline is required for airline staff role", 400);
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) throw new ApiError("User with this email or username already exists", 409);

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    role,
    gender,
    number,
    airline,
    specialization,
  });

  const created = await User.findById(user._id).select("-password -refreshToken");

  return res.status(201).json(
    new ApiResponse(201, created, "User created successfully")
  );
});
export { createUser };


//  Check the user role to give access
const checkUserRole = asyncHandler(async (req, res) => res.send("Admin route accessed successfully"));
export { checkUserRole };

const registerFlightDetails = asyncHandler(async (req, res) => {

    //register flight details
    const { flightNumber, aircraftRegistration, airlineName, aircraftType, origin, destination, sta, std, eta, etd } = req.body;


    // Check for existing flight with same flight number
    const existingFlight = await FlightDetails.findOne({ flightNumber });
    if (existingFlight) throw new ApiError("Flight with this number already exists", 409);

    // Create flight details
    const registerFlight = await FlightDetails.create({
        flightNumber,
        aircraftRegistration,
        airlineName,
        aircraftType,
        origin,
        destination,
        sta,
        std,
        eta,
        etd
    });
    return res
        .status(201)
        .json(new ApiResponse(201, registerFlight, "Flight registered successfully"));

})

export { registerFlightDetails };

const getAllFlights = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [flights, total] = await Promise.all([
        FlightDetails.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        FlightDetails.countDocuments()
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, {
            flights,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        }, "Flights retrieved successfully"));
});

export { getAllFlights };


const getAllUsers = asyncHandler(async (req, res) => {
    const Users = await User.find();
    const userData = Users.map(user => ({
        username: user.username,
        role: user.role,
        gender: user.gender
    }));

    res.status(200).json(new ApiResponse(200, userData, "Users retrieved successfully"));
});
export { getAllUsers };

const removeUser = asyncHandler(async (req, res) => {
    const { username, email } = req.query;

    if (!username && !email) {
        throw new ApiError('Provide username or email as query param', 400);
    }

    const existingUser = await User.findOne({
        $or: [
            ...(email ? [{ email }] : []),
            ...(username ? [{ username }] : [])
        ],
    });
    if (!existingUser) {
        throw new ApiError('User not found', 404);
    }

    // Find and delete user
    await User.deleteOne({ _id: existingUser._id });

    return res
        .status(200)
        .json(new ApiResponse(200, null, 'User removed successfully'));
});

export { removeUser };

const updateFlightStatus = asyncHandler(async (req, res) => {
    const { flightId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['arrived', 'departed'].includes(status)) {
        throw new ApiError('Invalid status. Must be "arrived" or "departed"', 400);
    }

    const flight = await FlightDetails.findById(flightId);
    if (!flight) {
        throw new ApiError('Flight not found', 404);
    }

    const io = req.app.get("io");

    // Handle different status transitions
    if (status === "arrived") {
        flight.status = 'arrived';
        flight.actualArrivalTime = new Date();
        flight.turnaroundStatus = TurnaroundStatus.LANDED;
        await flight.save();

        // Auto-transition to ON_BLOCK
        await TurnaroundManager.updateTurnaroundStatus(flightId, io);

        io.emit("flight_arrived", {
            flightId: flight._id,
            flightNumber: flight.flightNumber,
            turnaroundStatus: flight.turnaroundStatus
        });
    } else if (status === "departed") {
        await TurnaroundManager.markDeparted(flightId, io);
    }

    const updatedFlight = await FlightDetails.findById(flightId);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedFlight, `Flight status updated to ${status}`));
});

export { updateFlightStatus };

// Get turnaround summary for a flight
const getTurnaroundSummary = asyncHandler(async (req, res) => {
    const { flightId } = req.params;

    const summary = await TurnaroundManager.getTurnaroundSummary(flightId);

    return res
        .status(200)
        .json(new ApiResponse(200, summary, "Turnaround summary retrieved successfully"));
});

export { getTurnaroundSummary };