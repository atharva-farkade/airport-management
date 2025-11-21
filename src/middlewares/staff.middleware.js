import asyncHandler from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyStaffAccess = asyncHandler(async (req, res, next) => {
    try {
        const user = req.user;

        if (user.role === "airline_staff") {
            next();
            console.log("airline staff access granted.");
        } 
        else {
            return next(new ApiError("forbidden access", 403));
        }
        
    } catch (error) {
        return next(new ApiError("Internal server error.", 500));
    }
});