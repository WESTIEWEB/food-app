import express, { Request, Response, NextFunction}from 'express';
// import { Register } from '../controller/userController';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).send("CLICK TO VIEW DOCUMENTATION.")
})

export default router;