import { Router } from "express";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import { verifyStaffAccess } from "../middlewares/staff.middleware.js";
import { grantPermission } from "../controllers/admin.controller.js";
import { getAirplanes } from "../controllers/airplane.controller.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { requestServices } from "../controllers/service.controller.js";

const staffrouter = Router()

staffrouter.route("/").post(verifyJwt,verifyStaffAccess,grantPermission);
staffrouter.get("/flight-details", verifyJwt, authorizeRoles("airline_staff"), getAirplanes);
staffrouter.post("/service-request", verifyJwt, authorizeRoles("airline_staff"), requestServices);

export default staffrouter;