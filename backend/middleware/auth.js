import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const authUser = async (req, res, next) => {
    const { token } = req.headers;

    if (!token) {
        return res.json({ success: false, message: 'Not Authorized, Login Again' });
    }

    try {
        const secret = process.env.JWT_SECRET || 'fallback-secret';
        const token_decode = jwt.verify(token, secret);

        // Fetch user and check status
        const user = await userModel.findById(token_decode.id);
        if (!user) return res.json({ success: false, message: 'Not Authorized, Login Again' });
        if (user.status === 'disabled') return res.json({ success: false, message: 'Your account has been disabled by the administrator.' });
        if (user.status === 'deleted') return res.json({ success: false, message: 'Your account has been deleted by the administrator.' });

        req.userId = token_decode.id;

        if (!req.body) {
            req.body = {};
        }
        req.body.userId = token_decode.id;

        next();
    } catch (error) {
        console.log("Auth Middleware Error:", error);
        res.json({ success: false, message: 'Not Authorized, Login Again' });
    }
}

export default authUser;
