import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { checkUserRole, removeUser, updateFlightStatus, getTurnaroundSummary } from "../controllers/admin.controller.js";
import { registerFlightDetails } from "../controllers/admin.controller.js";
import { getAllFlights, getAllUsers } from "../controllers/admin.controller.js";

const adminrouter = Router()

adminrouter.route("/").post(verifyJwt, authorizeRoles("airport_admin"), checkUserRole);
adminrouter.route("/flight-details").post(verifyJwt, authorizeRoles("airport_admin"), registerFlightDetails);
adminrouter.route("/upcoming-flights").get(verifyJwt, authorizeRoles("airport_admin"), getAllFlights);
adminrouter.route("/users").get(verifyJwt, authorizeRoles("airport_admin"), getAllUsers);
adminrouter.route("/remove-user").delete(verifyJwt, authorizeRoles("airport_admin"), removeUser);
adminrouter.route("/flight/:flightId/status").patch(verifyJwt, authorizeRoles("airport_admin"), updateFlightStatus);
adminrouter.route("/flight/:flightId/turnaround").get(verifyJwt, authorizeRoles("airport_admin"), getTurnaroundSummary);

export default adminrouter;