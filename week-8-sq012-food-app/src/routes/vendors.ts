import express, { Request, Response, NextFunction}from 'express';
import { vendorLogin, createFood, vendorProfile, deleteFood, updateVendorProfile , GetAllVendors, GetFoodByVendor} from '../controller/vendorController';
import { authVendor } from '../middleware/auth'
import { upload } from '../utils/multer'

const router = express.Router()

router.post('/vendor-login', vendorLogin);
router.post('/create-food', authVendor, upload.single('image'), createFood );
router.get('/get-profile', authVendor, vendorProfile);
router.delete('/delete-food/:foodId', authVendor, deleteFood);
router.patch('/update-vendor', authVendor, upload.single('coverImage'), updateVendorProfile);
router.get('/get-vendor-food/:id',GetFoodByVendor)
router.get('/get-all-vendors',GetAllVendors)


export default router