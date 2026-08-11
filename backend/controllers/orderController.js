import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import cancelledOrderModel from '../models/cancelledOrderModel.js';
import Stripe from 'stripe';

const currency = 'usd';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. Placing orders using COD Method
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed Successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 2. Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: 10 * 100
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 3. Verify Stripe Payment
const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 4. Placing orders using Razorpay Method (Placeholder/Stub)
const placeOrderRazorpay = async (req, res) => {
    try {
        res.json({ success: false, message: "Razorpay integration pending or disabled" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 5. Verify Razorpay Payment (Placeholder/Stub)
const verifyRazorpay = async (req, res) => {
    try {
        res.json({ success: false, message: "Razorpay verification pending or disabled" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 6. All Orders data for Admin Panel
const allOrders = async (req, res) => {
    try {
        // Exclude orders that have been cancelled so admin main list doesn't show them
        const orders = await orderModel.find({ status: { $ne: 'Cancelled' } });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 7. User Order Data For Frontend
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 8. Update Order Status from Admin Panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: 'Status Updated' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 9. User requests cancellation
const requestCancel = async (req, res) => {
    try {
        const { orderId, reason } = req.body;
        await orderModel.findByIdAndUpdate(orderId, {
            cancellationRequested: true,
            cancellationReason: reason || '',
            cancellationRequestedAt: Date.now(),
            status: 'Cancellation Requested'
        });
        res.json({ success: true, message: 'Cancellation requested' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 10. Admin confirms cancellation (move to cancelled collection and remove original)
const adminConfirmCancel = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: 'Order not found or already removed' });
        }

        const cancelledBy = order.cancellationRequested ? 'user' : 'admin';

        const cancelledDoc = new cancelledOrderModel({
            originalOrderId: order._id.toString(),
            userId: order.userId,
            items: order.items,
            amount: order.amount,
            address: order.address,
            paymentMethod: order.paymentMethod,
            payment: order.payment,
            date: order.date,
            cancelledAt: Date.now(),
            cancelledBy,
            cancellationReason: order.cancellationReason || ''
        });

        await cancelledDoc.save();

        // Keep the original order for user visibility but mark it cancelled
        await orderModel.findByIdAndUpdate(orderId, {
            status: 'Cancelled',
            cancellationConfirmed: true,
            cancellationConfirmedAt: Date.now()
        });

        res.json({ success: true, message: 'Order cancelled and recorded; user will see cancellation.' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 11. List cancelled orders for admin
const allCancelledOrders = async (req, res) => {
    try {
        const cancelled = await cancelledOrderModel.find({});
        res.json({ success: true, cancelled });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 12. Permanently delete cancelled order
const deleteCancelledOrder = async (req, res) => {
    try {
        const { cancelledId } = req.body;
        await cancelledOrderModel.findByIdAndDelete(cancelledId);
        res.json({ success: true, message: 'Cancelled order permanently deleted' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    placeOrder,
    placeOrderStripe,
    placeOrderRazorpay,
    allOrders,
    userOrders,
    updateStatus,
    verifyStripe,
    verifyRazorpay,
    requestCancel,
    adminConfirmCancel
    , allCancelledOrders, deleteCancelledOrder
};