import { Router } from "express";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import { checkUserRole } from "../controllers/admin.controller.js";
import { verifyAdminAccess } from "../middlewares/admin.middleware.js";

const adminrouter = Router()

adminrouter.route("/").post(verifyJwt,verifyAdminAccess, checkUserRole);

export default adminrouter;