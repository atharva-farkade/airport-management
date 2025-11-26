import { Router } from "express";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import { verifyVendorAccess } from "../middlewares/vendor.middleware.js";
import { grantPermission } from "../controllers/admin.controller.js";
import { checkVendorRole } from "../controllers/vendor.controller.js";

const vendorrouter = Router()

vendorrouter.route("/").post(verifyJwt,verifyVendorAccess,checkVendorRole);
// vendorrouter.get("/flight-details", verifyJwt, authorizeRoles("service_vendor"), );
// vendorrouter.post("/service-request", verifyJwt, authorizeRoles("service_vendor"), );

export default vendorrouter;