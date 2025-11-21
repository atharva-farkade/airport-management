import asyncHandler from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyAdminAccess = asyncHandler(async (req, res, next) => {
    try {
        const user = req.user;

        if (user.role === "airport_admin") {
            next();
            console.log("airport Admin access granted.");
        } 
        else {
            return next(new ApiError("forbidden access", 403));
        }
        
    } catch (error) {
        return next(new ApiError("Internal server error.", 500));
    }
});