import {Router} from 'express';
import {    
    registerUser,
    loginUser,
    logoutUser,
    generateNewTokens,
    verifyUser,
    forgotPassword,
    changePassword,
    resendVerificationToken,
    changeEmail,
    updateEmail,
    forgotUserName,
    forgotEmail,
    changeUserName,
    registerOauthUser,
    handleOauthCallback,
    updateAvatar
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { uploadFile } from '../middlewares/multer.middleware.js';

const router=Router()
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/generateNewTokens").post(generateNewTokens)
router.route("/oauth").get(registerOauthUser)
router.route("/auth/oauth/callback").get(handleOauthCallback);

//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/verify").post(verifyJWT,verifyUser)
router.route("/forgotPassword").post(verifyJWT,forgotPassword)
router.route("/changePassword").post(verifyJWT, changePassword)
router.route("/resendVerificationToken").post(verifyJWT, resendVerificationToken)
router.route("/changeEmail").post(verifyJWT, changeEmail)
router.route("/updateEmail").post(verifyJWT, updateEmail)
router.route("/forgotUserName").post(verifyJWT, forgotUserName)
router.route("/forgotEmail").post(verifyJWT, forgotEmail)
router.route("/changeUserName").post(verifyJWT, changeUserName)
router.route("/updateAvatar").patch(verifyJWT, uploadFile.single("avatar"),updateAvatar)
export default router