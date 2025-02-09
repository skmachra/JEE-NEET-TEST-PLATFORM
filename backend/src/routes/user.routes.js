import { Router } from 'express'
import { loginUser, logoutUser, refreshAccessToken, registerUser, changeCurrentPassword, googleAuth, getCurrentUser, addBookmark, removeBookmark, getBookmark, getHistory } from '../controllers/user.controller.js'
import { verifyJWT } from '../middlewares/auth.middlewares.js'

const router = Router()

router.route("/register").post(registerUser)
router.route("/google-auth").post(googleAuth)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route('/bookmarks/add').post(verifyJWT, addBookmark);
router.route('/bookmarks/remove').post(verifyJWT, removeBookmark);
router.route('/bookmarks').get(verifyJWT, getBookmark);
router.route('/history').get(verifyJWT, getHistory);

export default router