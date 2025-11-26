import asyncHandler from '../utils/asyncHandlers.js';
import { FlightDetails } from '../models/flightDetails.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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