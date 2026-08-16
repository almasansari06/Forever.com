import jwt from 'jsonwebtoken';
import adminModel from '../models/adminModel.js';

const normalizeAdminEmail = (value) => String(value || '').trim().toLowerCase();

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: 'Not Authorized Login Again' });
        }

        const secret = process.env.JWT_SECRET || 'fallback-secret';
        const decoded = jwt.verify(token, secret);
        const adminEmail = normalizeAdminEmail(decoded?.email || decoded?.adminEmail || process.env.ADMIN_EMAIL || 'foreverglobal.new@gmail.com');
        const passwordVersion = Number(decoded?.passwordVersion || 1);

        const admin = await adminModel.findOne({ email: adminEmail });
        if (!admin) {
            const requiredEmail = normalizeAdminEmail(process.env.ADMIN_EMAIL || 'foreverglobal.new@gmail.com');
            if (adminEmail !== requiredEmail) {
                return res.json({ success: false, message: 'Not Authorized Login Again' });
            }
        }

        const currentVersion = admin ? Number(admin.passwordVersion || 1) : 1;
        if (currentVersion !== passwordVersion) {
            return res.json({ success: false, message: 'Session expired. Please login again.' });
        }

        req.admin = admin || { email: adminEmail };
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Not Authorized Login Again' });
    }
};

export default adminAuth