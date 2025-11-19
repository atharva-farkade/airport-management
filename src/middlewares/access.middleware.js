import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandlers.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyAdminAccess = (req, res,next) => 
    {
        
        const user = req.user;
        console.log("Verifying admin access for user:", req, req.user);

        if(user.role === "airport_admin") next();
        else
        {
            return next( new ApiError("forbidden access",403));
        }
        
    }