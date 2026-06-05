import { Router } from "express";
import rateLimit from "express-rate-limit";
import { loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJwt} from "../middlewares/auth.middleware.js";

const router = Router()

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { success: false, message: "Too many attempts, please try again after 15 minutes" }
});

router.route("/login").post(authLimiter, loginUser)
//secured routes
router.route("/logout").post(verifyJwt, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router;