import { Router } from "express";
import { registerUser, loginUser,logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import { checkUserRole } from "../controllers/admin.controller.js";
import { verifyAdminAccess } from "../middlewares/admin.middleware.js";
import send from "send";

const adminrouter = Router()

adminrouter.route("/admin").post(verifyJwt,verifyAdminAccess, checkUserRole);

export default adminrouter;