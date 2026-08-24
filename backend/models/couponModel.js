import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercentage: { type: Number, required: true, min: 10, max: 100 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const couponModel = mongoose.models.coupon || mongoose.model('coupon', couponSchema);

export default couponModel;
