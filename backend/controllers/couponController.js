import couponModel from '../models/couponModel.js';

const normalizeCode = (code) => String(code || '').trim().toUpperCase();

const findActiveCoupon = async (code) => {
    const normalizedCode = normalizeCode(code);
    if (!normalizedCode) return null;
    return couponModel.findOne({ code: normalizedCode, isActive: true });
};

const listCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const addCoupon = async (req, res) => {
    try {
        const code = normalizeCode(req.body.code);
        const discountPercentage = Number(req.body.discountPercentage);

        if (!code) {
            return res.json({ success: false, message: 'Coupon code is required.' });
        }
        if (!Number.isInteger(discountPercentage) || discountPercentage < 10 || discountPercentage > 100) {
            return res.json({ success: false, message: 'Discount must be between 10% and 100%.' });
        }

        const existingCoupon = await couponModel.findOne({ code });
        if (existingCoupon) {
            return res.json({ success: false, message: 'Coupon code already exists.' });
        }

        const coupon = await couponModel.create({ code, discountPercentage, isActive: true });
        res.json({ success: true, message: 'Coupon created successfully.', coupon });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const deleteCoupon = async (req, res) => {
    try {
        const code = normalizeCode(req.body.code);
        const deletedCoupon = await couponModel.findOneAndDelete({ code });
        if (!deletedCoupon) {
            return res.json({ success: false, message: 'Coupon not found.' });
        }
        res.json({ success: true, message: 'Coupon deleted successfully.' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const toggleCoupon = async (req, res) => {
    try {
        const code = normalizeCode(req.body.code);
        const coupon = await couponModel.findOne({ code });
        if (!coupon) {
            return res.json({ success: false, message: 'Coupon not found.' });
        }
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        res.json({ success: true, message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}.`, coupon });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const validateCoupon = async (req, res) => {
    try {
        const coupon = await findActiveCoupon(req.body.code);
        if (!coupon) {
            return res.json({ success: false, message: 'Invalid or inactive coupon code.' });
        }
        res.json({ success: true, coupon: { code: coupon.code, discountPercentage: coupon.discountPercentage } });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addCoupon, deleteCoupon, findActiveCoupon, listCoupons, toggleCoupon, validateCoupon };
