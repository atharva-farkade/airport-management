import { Router } from "express";
import { registerUser, loginUser,logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import { verifyStaffAccess } from "../middlewares/staff.middleware.js";
import { grantPermission } from "../controllers/admin.controller.js";

const staffrouter = Router()

staffrouter.route("/staff").post(verifyJwt,verifyStaffAccess,grantPermission);

export default staffrouter;