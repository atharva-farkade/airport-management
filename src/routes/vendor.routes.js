import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import {
    getMyTasks,
    startService,
    updateServiceProgress
} from "../controllers/service.controller.js";
import { checkVendorRole } from "../controllers/vendor.controller.js";

const vendorrouter = Router()

vendorrouter.route("/").post(verifyJwt, authorizeRoles("service_vendor"), checkVendorRole);
vendorrouter.get("/my-tasks", verifyJwt, authorizeRoles("service_vendor"), getMyTasks);
vendorrouter.patch("/service/:serviceRequestId/start", verifyJwt, authorizeRoles("service_vendor"), startService);
vendorrouter.patch("/service/:serviceRequestId/update", verifyJwt, authorizeRoles("service_vendor"), updateServiceProgress);

export default vendorrouter;