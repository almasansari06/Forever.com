import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import cancelledOrderModel from '../models/cancelledOrderModel.js';
import { findActiveCoupon } from './couponController.js';
import Stripe from 'stripe';
import { sendOrderEmail, sendOrderStatusEmail } from '../utils/emailService.js';

const currency = 'usd';
const fallbackCurrencyRates = {
    USD: 1, INR: 83.5, AED: 3.67, SAR: 3.75, QAR: 3.64,
    KWD: 0.307, BHD: 0.376, GBP: 0.79, EUR: 0.92, CAD: 1.37,
    AUD: 1.53, SGD: 1.34, JPY: 157, CNY: 7.2
};
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const fetchLiveCurrencyRates = async () => {
    const endpoints = [
        'https://open.er-api.com/v6/latest/USD',
        'https://api.exchangerate.host/latest?base=USD',
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint);
            if (!response.ok) continue;

            const data = await response.json();
            const rates = data?.rates;

            if (rates && typeof rates === 'object' && Object.keys(rates).length > 0) {
                return Object.fromEntries(
                    Object.entries(rates).map(([key, value]) => [String(key).toUpperCase(), Number(value)])
                );
            }
        } catch (error) {
            console.log('Live currency fetch failed:', endpoint, error.message);
        }
    }

    return fallbackCurrencyRates;
};

const getOrderCurrency = async (currencyCode) => {
    const code = String(currencyCode || '').toUpperCase();
    const liveRates = await fetchLiveCurrencyRates();
    const rate = Number(liveRates[code]);
    return Number.isFinite(rate) ? { code, rate } : { code: 'USD', rate: 1 };
};

const mergeOrderItems = (items = []) => {
    const mergedItems = new Map();

    items.forEach((item) => {
        const key = `${item._id || item.id || item.name}:${item.size || 'default'}`;
        const existingItem = mergedItems.get(key);

        if (existingItem) {
            existingItem.quantity += Number(item.quantity) || 0;
        } else {
            mergedItems.set(key, {
                ...item,
                quantity: Number(item.quantity) || 0,
            });
        }
    });

    return [...mergedItems.values()].filter((item) => item.quantity > 0);
};

const calculateOrderTotals = async (items, couponCode) => {
    const subtotal = items.reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0);
    const coupon = couponCode ? await findActiveCoupon(couponCode) : null;

    if (couponCode && !coupon) {
        throw new Error('Invalid or inactive coupon code.');
    }

    const discount = coupon ? (subtotal * coupon.discountPercentage) / 100 : 0;
    return {
        subtotal,
        discount,
        coupon,
        amount: Math.max(0, subtotal - discount + 10),
    };
};

// 1. Placing orders using COD Method
const placeOrder = async (req, res) => {
    try {
        const { userId, items, address, couponCode } = req.body;
        const orderCurrency = await getOrderCurrency(req.body.currency);
        const mergedItems = mergeOrderItems(items);
        const { amount, coupon } = await calculateOrderTotals(mergedItems, couponCode);

        const orderData = {
            userId,
            items: mergedItems,
            address,
            amount,
            currency: orderCurrency.code,
            currencyRate: orderCurrency.rate,
            couponCode: coupon?.code || '',
            discountPercentage: coupon?.discountPercentage || 0,
            paymentMethod: "COD",
            payment: false,
            paymentApproved: false,
            status: 'Order Placed',
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const user = await userModel.findById(userId).select('name email');
        if (user && user.email) {
            try {
                await sendOrderEmail({
                    to: user.email,
                    name: user.name,
                    order: {
                        ...newOrder.toObject(),
                        address: address || {}
                    }
                });
            } catch (emailError) {
                console.log('Order email failed:', emailError.message);
            }
        }

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
        if (!stripe) {
            return res.json({ success: false, message: 'Stripe is not configured on this server.' });
        }

        const { userId, items, address, couponCode } = req.body;
        const orderCurrency = await getOrderCurrency(req.body.currency);
        const { origin } = req.headers;
        const mergedItems = mergeOrderItems(items);
        const { amount, coupon } = await calculateOrderTotals(mergedItems, couponCode);

        const orderData = {
            userId,
            items: mergedItems,
            address,
            amount,
            currency: orderCurrency.code,
            currencyRate: orderCurrency.rate,
            couponCode: coupon?.code || '',
            discountPercentage: coupon?.discountPercentage || 0,
            paymentMethod: "Stripe",
            payment: false,
            paymentApproved: false,
            status: 'Payment Pending',
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const user = await userModel.findById(userId).select('name email');
        if (user && user.email) {
            try {
                await sendOrderEmail({
                    to: user.email,
                    name: user.name,
                    order: {
                        ...newOrder.toObject(),
                        address: address || {}
                    }
                });
            } catch (emailError) {
                console.log('Order email failed:', emailError.message);
            }
        }

        const discountMultiplier = coupon ? 1 - (coupon.discountPercentage / 100) : 1;
        const line_items = mergedItems
            .filter((item) => Math.round(item.price * discountMultiplier * 100) > 0)
            .map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: Math.round(item.price * discountMultiplier * 100)
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
            await orderModel.findByIdAndUpdate(orderId, {
                payment: true,
                paymentApproved: false,
                status: 'Payment Pending'
            });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true, message: 'Payment received. Your order is being processed and will be confirmed shortly.' });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const approveOrderPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.json({ success: false, message: 'Order ID is required' });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }

        if (order.paymentMethod !== 'Stripe') {
            return res.json({ success: false, message: 'Only Stripe payments require approval' });
        }

        if (order.paymentApproved) {
            return res.json({ success: false, message: 'This payment is already approved' });
        }

        await orderModel.findByIdAndUpdate(orderId, {
            paymentApproved: true,
            paymentApprovedAt: Date.now(),
            payment: true,
            status: 'Order Placed'
        });

        const user = await userModel.findById(order.userId).select('name email');
        if (user && user.email) {
            try {
                await sendOrderStatusEmail({
                    to: user.email,
                    name: user.name,
                    order: { ...order.toObject(), paymentApproved: true, status: 'Order Placed' },
                    status: 'Order Placed',
                    customMessage: 'Your payment has been approved and your order is now placed.'
                });
            } catch (emailError) {
                console.log('Order approval email failed:', emailError.message);
            }
        }

        res.json({ success: true, message: 'Payment approved successfully' });
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
        const orders = await orderModel.find({
            $or: [
                { status: { $ne: 'Cancelled' } },
                { cancellationRequested: true },
                { returnRequested: true }
            ]
        });

        const populatedOrders = [];
        for (const order of orders) {
            const user = await userModel.findById(order.userId).select('name');
            populatedOrders.push({
                ...order.toObject(),
                userName: user?.name || 'Unknown User'
            });
        }

        res.json({ success: true, orders: populatedOrders });
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

const orderDetails = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.json({ success: false, message: 'Order ID is required' });
        }

        const order = await orderModel.findOne({ _id: orderId, userId: req.userId });
        if (!order) {
            return res.json({ success: false, message: 'Order not found for this account' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 8. Update Order Status from Admin Panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }

        if (order.status === 'Delivered') {
            return res.json({ success: false, message: 'This order has already been delivered and can no longer be changed.' });
        }

        if (status === 'Delivered') {
            await orderModel.findByIdAndUpdate(orderId, {
                status,
                cancellationRequested: false,
                cancellationConfirmed: false,
                cancelledBy: '',
                cancelledMessage: ''
            });
        } else {
            await orderModel.findByIdAndUpdate(orderId, { status });
        }

        const user = await userModel.findById(order.userId).select('name email');
        if (user && user.email && ['Packing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'].includes(status)) {
            try {
                await sendOrderStatusEmail({
                    to: user.email,
                    name: user.name,
                    order: { ...order.toObject(), status },
                    status,
                    customMessage: status === 'Delivered' ? 'Your order has been delivered successfully.' : undefined
                });
            } catch (emailError) {
                console.log('Order status email failed:', emailError.message);
            }
        }

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
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }

        if (order.status === 'Delivered' || order.status === 'Cancelled') {
            return res.json({ success: false, message: 'This order cannot be cancelled at this stage.' });
        }

        if (order.cancellationRequested) {
            return res.json({ success: false, message: 'A cancellation request is already pending for this order.' });
        }

        await orderModel.findByIdAndUpdate(orderId, {
            status: order.status,
            cancellationRequested: true,
            cancellationReason: reason || '',
            cancellationRequestedAt: Date.now(),
            cancelledBy: 'user',
            cancelledMessage: "Let's verify your cancelling order.",
            cancellationConfirmed: false
        });

        const updatedOrder = await orderModel.findById(orderId);
        const user = await userModel.findById(order.userId).select('name email');
        if (user && user.email) {
            try {
                await sendOrderStatusEmail({
                    to: user.email,
                    name: user.name,
                    order: updatedOrder.toObject(),
                    status: order.status,
                    customMessage: 'Your cancellation request has been sent to the admin for review.'
                });
            } catch (emailError) {
                console.log('Cancellation request email failed:', emailError.message);
            }
        }

        res.json({ success: true, message: 'Your cancellation request has been sent.' });
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

        if ((order.status === 'Delivered' || order.status === 'Cancelled') && !order.cancellationRequested) {
            return res.json({ success: false, message: 'This order cannot be cancelled at this stage.' });
        }

        const isUserRequested = !!order.cancellationRequested;
        const cancelledBy = isUserRequested ? 'user' : 'admin';
        const cancellationMessage = isUserRequested
            ? 'Your order has been cancelled successfully.'
            : 'Due to some technical issue, your order has been cancelled.';

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

        await orderModel.findByIdAndUpdate(orderId, {
            status: 'Cancelled',
            cancellationRequested: false,
            cancellationConfirmed: true,
            cancellationConfirmedAt: Date.now(),
            cancelledBy,
            cancelledMessage: cancellationMessage
        });

        const updatedOrder = await orderModel.findById(orderId);
        const user = await userModel.findById(order.userId).select('name email');
        if (user && user.email) {
            try {
                await sendOrderStatusEmail({
                    to: user.email,
                    name: user.name,
                    order: updatedOrder.toObject(),
                    status: 'Cancelled',
                    customMessage: cancellationMessage
                });
            } catch (emailError) {
                console.log('Order cancellation email failed:', emailError.message);
            }
        }

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

// 13. Admin rejects cancellation request
const rejectCancellation = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }

        if ((order.status === 'Delivered' || order.status === 'Cancelled') && !order.cancellationRequested) {
            return res.json({ success: false, message: 'This order cannot be updated right now.' });
        }

        await orderModel.findByIdAndUpdate(orderId, {
            cancellationRequested: false,
            cancellationConfirmed: false,
            cancellationReason: '',
            cancelledBy: '',
            cancelledMessage: '',
            status: order.status === 'Cancelled' ? 'Order Placed' : order.status
        });

        const updatedOrder = await orderModel.findById(orderId);
        const user = await userModel.findById(order.userId).select('name email');
        if (user && user.email) {
            try {
                await sendOrderStatusEmail({
                    to: user.email,
                    name: user.name,
                    order: updatedOrder.toObject(),
                    status: updatedOrder.status,
                    customMessage: 'Your cancellation request was reviewed and your order is continuing normally.'
                });
            } catch (emailError) {
                console.log('Cancellation rejection email failed:', emailError.message);
            }
        }

        res.json({ success: true, message: 'Cancellation request rejected' });
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
    orderDetails,
    updateStatus,
    verifyStripe,
    approveOrderPayment,
    verifyRazorpay,
    requestCancel,
    adminConfirmCancel,
    rejectCancellation,
    allCancelledOrders,
    deleteCancelledOrder
};