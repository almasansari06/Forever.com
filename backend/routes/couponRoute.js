import express from 'express';
import { addCoupon, deleteCoupon, listCoupons, toggleCoupon, validateCoupon } from '../controllers/couponController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const couponRouter = express.Router();

couponRouter.get('/list', adminAuth, listCoupons);
couponRouter.post('/add', adminAuth, addCoupon);
couponRouter.post('/delete', adminAuth, deleteCoupon);
couponRouter.post('/toggle', adminAuth, toggleCoupon);
couponRouter.post('/validate', authUser, validateCoupon);

export default couponRouter;
