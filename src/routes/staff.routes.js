import { Router } from "express";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import { verifyStaffAccess } from "../middlewares/staff.middleware.js";
import { getAirplanes } from "../controllers/airplane.controller.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { requestServices } from "../controllers/service.controller.js";
import { grantPermission } from "../controllers/service.controller.js";
import { getArrivedFlights } from "../controllers/user.controller.js";

const staffrouter = Router()

staffrouter.route("/").post(verifyJwt,verifyStaffAccess,grantPermission);
staffrouter.get("/flight-details", verifyJwt, authorizeRoles("airline_staff"), getArrivedFlights);
staffrouter.post("/service-request", verifyJwt, authorizeRoles("airline_staff"), requestServices);

export default staffrouter;