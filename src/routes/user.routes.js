import {Router} from 'express'
import registerUser, { currentAccountUpdate, getCurrentUser, loginUser, logoutUser, refreshAccessToken, updatePassword } from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { VerifyJWT } from '../middlewares/auth.middleware.js'

const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// secure route
router.route("/logout").post(VerifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/update-password").patch(VerifyJWT,updatePassword)
router.route("/get-login-user").get(VerifyJWT,getCurrentUser)
router.route("/update-user-email").patch(VerifyJWT,currentAccountUpdate)

export default router