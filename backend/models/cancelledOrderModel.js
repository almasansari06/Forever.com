import mongoose from 'mongoose';

const cancelledOrderSchema = new mongoose.Schema({
    originalOrderId: { type: String, required: true },
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false },
    date: { type: Number, required: true },
    cancelledAt: { type: Number, required: true },
    cancelledBy: { type: String, required: true }, // 'admin' | 'user'
    cancellationReason: { type: String, default: '' }
});

const cancelledOrderModel = mongoose.models.cancelled_order || mongoose.model('cancelled_order', cancelledOrderSchema);
export default cancelledOrderModel;
