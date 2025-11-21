import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandlers.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError("unauthorised request", 401);
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // console.log("Decoded token:", decodedToken);

        const user = await User.findById(decodedToken?._id).
            select("-password -refreshToken -watchHistory")
        // console.log("User found:", user);

        if (!user) {
            throw new ApiError("Invalid Access Token", 401);
        }

        req.user = user;
        console.log("Authentication successful, jwt verifyed");
        next();
    } catch (error) {
        return next(new ApiError("unauthorised request", 401));

    }
})