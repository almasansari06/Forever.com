import express from 'express'
import { placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe, verifyRazorpay, requestCancel, adminConfirmCancel, allCancelledOrders, deleteCancelledOrder } from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)
orderRouter.post('/admin-cancel', adminAuth, adminConfirmCancel)
orderRouter.post('/cancelled-list', adminAuth, allCancelledOrders)
orderRouter.post('/cancelled-delete', adminAuth, deleteCancelledOrder)

// Payment Features
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

// User Features
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.post('/cancel', authUser, requestCancel)

// verifyPayment
orderRouter.post('/verifyStripe', authUser, verifyStripe)
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)

export default orderRouter
