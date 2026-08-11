import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
        const secret = process.env.JWT_SECRET || 'fallback-secret';
        const token_decode = jwt.verify(token, secret);
        if (token_decode !== (process.env.ADMIN_EMAIL || 'admin@example.com') + (process.env.ADMIN_PASSWORD || 'admin123')) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
        next()
    } catch (error) {
        console.log(error);

        res.json({ success: false, message: 'Not Authorized Login Again' });
    }
}

export default adminAuth