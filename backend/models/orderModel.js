import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default: 'Order Placed' },
    // Cancellation workflow
    cancellationRequested: { type: Boolean, required: true, default: false },
    cancellationReason: { type: String, default: '' },
    cancellationRequestedAt: { type: Number },
    cancellationConfirmed: { type: Boolean, required: true, default: false },
    cancellationConfirmedAt: { type: Number },
    cancelledBy: { type: String, default: '' },
    cancelledMessage: { type: String, default: '' },
    paymentMethod: { type: String, required: true }, // 'COD' ya 'Stripe'
    payment: { type: Boolean, required: true, default: false },
    date: { type: Number, required: true }
});

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);
export default orderModel;