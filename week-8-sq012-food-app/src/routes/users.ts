import express, { Request, Response, NextFunction}from 'express';
import { Register,Login , verifyUser, resendOTP, getAllUser, getUser, updateUserProfile} from '../controller/userController';
import { auth } from '../middleware/auth'

const router = express.Router();

router.post('/signup', Register);
router.post('/verify/:signature',auth, verifyUser);
router.post('/login', Login);
router.get('/resend-otp/:signature', resendOTP);
router.get('/get-all-users', auth, getAllUser);
router.get('/get-user', auth, getUser);
router.patch('/update-profile', auth, updateUserProfile);

export default router;