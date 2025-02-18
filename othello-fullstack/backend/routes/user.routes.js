import {Router} from 'express';
import { logoutUser, registerUser ,loginUser,generateNewTokens} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router=Router()
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/generateNewTokens").post(verifyJWT,generateNewTokens)
export default router