import asyncHandler from '../utils/asyncHandlers.js';
import { FlightDetails } from '../models/flightDetails.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';


//  Check the user role to give access
const checkUserRole = asyncHandler(async (req, res) => res.send("Admin route accessed successfully"));
console.log("Admin route accessed by user");
export { checkUserRole };

const registerFlightDetails = asyncHandler(async (req, res) => {

    //register flight details
    const { flightNumber, aircraftRegistration, airlineName, aircraftType, origin, destination, sta, std, eta, etd } = req.body;


    // Check for existing flight
    const existingFlight = await FlightDetails.findOne({
        $or: [{ flightNumber }, { aircraftRegistration }],
    });
    if (existingFlight) throw new ApiError("Flight already exists", 409);

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
    const flights = await FlightDetails.find();
    return res
    .status(200)
    .json(new ApiResponse(200, flights, "Flights retrieved successfully"));
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
      const { username, email } = req.body;
      const existingUser = await User.findOne({
    $or: [{ email }, { username }],
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
    if (!['scheduled', 'arrived'].includes(status)) {
        throw new ApiError('Invalid status. Must be "scheduled" or "arrived"', 400);
    }

    // Find and update flight
    const flight = await FlightDetails.findByIdAndUpdate(
        flightId,
        { status, etd: status === 'arrived' ? new Date() : undefined },
        { new: true }
    );

    if (!flight) {
        throw new ApiError('Flight not found', 404);
    }

    const io = req.app.get("io");
    if (status === "arrived") {
        io.emit("flight_arrived", flight);  
        console.log("SOCKET EVENT SENT: flight_arrived");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, flight, `Flight status updated to ${status}`));
});

export { updateFlightStatus };