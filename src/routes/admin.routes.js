import { Router } from "express";
import { registerUser, loginUser,logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import send from "send";

const adminrouter = Router()

adminrouter.route("/admin").post((req, res) =>res.send("Admin route accessed successfully"));



export default adminrouter;