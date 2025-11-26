import asyncHandler from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyVendorAccess = asyncHandler(async (req, res, next) => {
    try {
        const user = req.user;

        if (user.role === "service_vendor") {
            next();
            console.log("service vendor access granted.");
        } 
        else {
            return next(new ApiError("forbidden access", 403));
        }
        
    } catch (error) {
        return next(new ApiError("Internal server error.", 500));
    }
});