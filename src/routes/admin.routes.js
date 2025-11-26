import { Router } from "express";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import { checkUserRole } from "../controllers/admin.controller.js";
import { verifyAdminAccess } from "../middlewares/admin.middleware.js";
import {registerFlightDetails} from "../controllers/admin.controller.js";

const adminrouter = Router()

adminrouter.route("/").post(verifyJwt,verifyAdminAccess, checkUserRole);
adminrouter.route("/flight-details").post(verifyJwt,verifyAdminAccess, registerFlightDetails);



export default adminrouter;