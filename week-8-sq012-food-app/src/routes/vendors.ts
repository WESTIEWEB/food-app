import express, { Request, Response, NextFunction}from 'express';
import { vendorLogin, createFood, vendorProfile, deleteFood } from '../controller/vendorController';
import { authVendor } from '../middleware/auth'

const router = express.Router()

router.post('/vendor-login', vendorLogin);
router.post('/create-food', authVendor, createFood );
router.get('/get-profile', authVendor, vendorProfile);
router.delete('/delete-food/:foodId', authVendor, deleteFood);

export default router