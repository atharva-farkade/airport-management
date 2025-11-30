import { Router } from "express";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import { checkUserRole, removeUser, updateFlightStatus } from "../controllers/admin.controller.js";
import { verifyAdminAccess } from "../middlewares/admin.middleware.js";
import {registerFlightDetails} from "../controllers/admin.controller.js";
import {getAllFlights, getAllUsers } from "../controllers/admin.controller.js";

const adminrouter = Router()

adminrouter.route("/").post(verifyJwt,verifyAdminAccess, checkUserRole);
adminrouter.route("/flight-details").post(verifyJwt,verifyAdminAccess, registerFlightDetails);
adminrouter.route("/upcoming-flights").get(verifyJwt,verifyAdminAccess, getAllFlights);
adminrouter.route("/users").get(verifyJwt,verifyAdminAccess, getAllUsers);
adminrouter.route("/remove-user").delete(verifyJwt,verifyAdminAccess, removeUser);
adminrouter.route("/flight/:flightId/status").patch(verifyJwt,verifyAdminAccess, updateFlightStatus);

export default adminrouter;