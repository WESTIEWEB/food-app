import express, { Request, Response, NextFunction}from 'express';
import { createAdmin, createSuperAdmin, createVendor } from '../controller/adminController';
import { auth } from '../middleware/auth'

const router = express.Router();

router.post('/create-admin', auth, createAdmin);
router.post('/create-super', createSuperAdmin);
router.post('/create-vendors', auth, createVendor)


export default router;