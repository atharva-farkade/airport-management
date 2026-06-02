import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import {
    requestServices,
    grantPermission,
    getFlightServices,
    verifyService
} from "../controllers/service.controller.js";
import { getArrivedFlights } from "../controllers/user.controller.js";

const staffrouter = Router()

staffrouter.route("/").post(verifyJwt, authorizeRoles("airline_staff"), grantPermission);
staffrouter.get("/flight-details", verifyJwt, authorizeRoles("airline_staff"), getArrivedFlights);
staffrouter.post("/service-request", verifyJwt, authorizeRoles("airline_staff"), requestServices);
staffrouter.get("/flight/:flightId/services", verifyJwt, authorizeRoles("airline_staff"), getFlightServices);
staffrouter.patch("/service/:serviceRequestId/verify", verifyJwt, authorizeRoles("airline_staff"), verifyService);

export default staffrouter;