import { Router } from "express";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import { checkFinanceRole } from "../controllers/finance.controller.js";
import { verifyFinanceAccess } from "../middlewares/finance.middleware.js";

const financerouter = Router()

financerouter.route("/").post(verifyJwt,verifyFinanceAccess,checkFinanceRole);
// financerouter.get("/flight-details", verifyJwt, authorizeRoles("airline_staff"), getAirplanes);
// financerouter.post("/service-request", verifyJwt, authorizeRoles("airline_staff"), requestServices);

export default financerouter;