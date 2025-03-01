import {Router} from 'express';
import {    
    registerUser,
    registerOauthUser,
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
    updateAvatar,
    handleGoogleOauthCallback,
    handleGithubOauthCallback,
    handleSpotifyOauthCallback,
    initialize2FA,
    verify2FA,
    verify2FALogin,
    // getCsrfToken
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { uploadFile } from '../middlewares/multer.middleware.js';
// import { verifyCsrfToken } from '../middlewares/csrfToken.middleware.js';
const router=Router()
// router.route("/getCsrfToken").get(getCsrfToken)
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/generateNewTokens").post(generateNewTokens)
router.route("/oauth").get(registerOauthUser)
router.route("/auth/oauth/google/callback").get(handleGoogleOauthCallback);
router.route("/auth/oauth/github/callback").get(handleGithubOauthCallback);
router.route("/auth/oauth/spotify/callback").get(handleSpotifyOauthCallback);
router.route("/verify2FALogin").post(verify2FALogin)
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
router.route("/initialize2FA").post(verifyJWT, initialize2FA)
router.route("/verify2FA").post(verifyJWT, verify2FA)
export default router