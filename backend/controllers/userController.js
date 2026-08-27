import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import cancelledOrderModel from "../models/cancelledOrderModel.js";
import adminModel from "../models/adminModel.js";
import cameraCaptureModel from "../models/cameraCaptureModel.js";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { sendWelcomeEmail, sendJobApplicationEmail, sendJobApplicationToAdmin, sendLoginOtpEmail, sendPasswordResetOtpEmail } from '../utils/emailService.js';

// Helper function to create JWT Token
const createToken = (id, passwordVersion = 1) => {
    return jwt.sign({ id, passwordVersion }, process.env.JWT_SECRET || 'fallback-secret');
}

// User Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password are required' });
        }

        const user = await userModel.findOne({ email: String(email).trim().toLowerCase() });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        if (user.status === 'disabled') {
            return res.json({ success: false, message: "Your account has been disabled by the administrator. You cannot perform actions. Please contact support." });
        }
        if (user.status === 'deleted') {
            return res.json({ success: false, message: "Your account has been deleted by the administrator and cannot be used. You cannot register a new account with this email." });
        }

        const isMatch = password === user.password;

        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const otpExpiry = Date.now() + 5 * 60 * 1000;

        user.loginOtp = otp;
        user.loginOtpExpiry = otpExpiry;
        await user.save();

        try {
            await sendLoginOtpEmail({ to: user.email, otp, name: user.name });
        } catch (emailError) {
            console.log('Login OTP email failed:', emailError.message);
            return res.json({ success: false, message: 'Unable to send verification code. Please try again later.' });
        }

        res.json({ success: true, requiresOtp: true, message: 'Verification code sent to your email. Please enter it to continue.' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const verifyLoginOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.json({ success: false, message: 'Email and verification code are required' });
        }

        const user = await userModel.findOne({ email: String(email).trim().toLowerCase() });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        if (user.status === 'disabled') {
            return res.json({ success: false, message: 'Your account has been disabled by the administrator.' });
        }
        if (user.status === 'deleted') {
            return res.json({ success: false, message: 'Your account has been deleted by the administrator.' });
        }

        const now = Date.now();
        if (!user.loginOtp || !user.loginOtpExpiry || now > user.loginOtpExpiry) {
            return res.json({ success: false, message: 'Verification code expired. Please login again.' });
        }

        if (String(user.loginOtp) !== String(otp).trim()) {
            return res.json({ success: false, message: 'Invalid verification code' });
        }

        user.loginOtp = '';
        user.loginOtpExpiry = 0;
        await user.save();

        const token = createToken(user._id, user.passwordVersion || 1);
        return res.json({ success: true, token, message: 'Login successful' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: 'Email is required' });
        }

        const user = await userModel.findOne({ email: String(email).trim().toLowerCase() });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        if (user.status === 'disabled') {
            return res.json({ success: false, message: 'Your account has been disabled by the administrator.' });
        }
        if (user.status === 'deleted') {
            return res.json({ success: false, message: 'Your account has been deleted by the administrator.' });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const otpExpiry = Date.now() + 5 * 60 * 1000;

        user.resetOtp = otp;
        user.resetOtpExpiry = otpExpiry;
        await user.save();

        try {
            await sendPasswordResetOtpEmail({ to: user.email, otp, name: user.name });
        } catch (emailError) {
            console.log('Password reset OTP email failed:', emailError.message);
            return res.json({ success: false, message: 'Unable to send reset code. Please try again later.' });
        }

        return res.json({ success: true, message: 'Reset code sent to your email. Please enter it to continue.' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.json({ success: false, message: 'Email and verification code are required' });
        }

        const user = await userModel.findOne({ email: String(email).trim().toLowerCase() });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        const now = Date.now();
        if (!user.resetOtp || !user.resetOtpExpiry || now > user.resetOtpExpiry) {
            return res.json({ success: false, message: 'Verification code expired. Please request a new one.' });
        }

        if (String(user.resetOtp) !== String(otp).trim()) {
            return res.json({ success: false, message: 'Invalid verification code' });
        }

        await user.save();

        return res.json({ success: true, message: 'Code verified. Set your new password.' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: 'Email and new password are required' });
        }

        if (String(password).length < 8) {
            return res.json({ success: false, message: 'Please enter a strong password' });
        }

        const user = await userModel.findOne({ email: String(email).trim().toLowerCase() });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        user.password = String(password);
        user.passwordVersion = Number(user.passwordVersion || 1) + 1;
        user.resetOtp = '';
        user.resetOtpExpiry = 0;
        await user.save();

        return res.json({ success: true, message: 'Password updated successfully. All previous logins have been logged out.' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const saveCameraCapture = async (req, res) => {
    try {
        const { userId, imageData, mimeType = 'image/jpeg' } = req.body;

        if (!userId || !imageData) {
            return res.json({ success: false, message: 'User ID and image data are required' });
        }

        const capture = await cameraCaptureModel.create({
            userId,
            imageData,
            mimeType,
            capturedAt: new Date(),
        });

        return res.json({ success: true, captureId: capture._id, message: 'Camera capture saved successfully' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

// User Register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, contacts } = req.body;

        const exists = await userModel.findOne({ email: String(email).trim().toLowerCase() });
        if (exists) {
            if (exists.status === 'deleted') {
                return res.json({ success: false, message: "This email was previously deleted by the administrator. You cannot register with this email." });
            }
            return res.json({ success: false, message: "User already exists" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        const safeContacts = Array.isArray(contacts)
            ? contacts
                .map((contact) => {
                    if (typeof contact === 'string') return contact.trim();
                    if (contact && typeof contact === 'object') {
                        const nameValue = contact.name || '';
                        const valueValue = contact.phone || contact.mobile || contact.tel || contact.value || '';
                        if (!nameValue && !valueValue) return null;
                        return { name: String(nameValue).trim(), phone: String(valueValue).trim() };
                    }
                    return null;
                })
                .filter(Boolean)
            : [];

        const newUser = new userModel({
            name,
            email: String(email).trim().toLowerCase(),
            password: password,
            contacts: safeContacts
        });

        const user = await newUser.save();
        const token = createToken(user._id, user.passwordVersion || 1);

        try {
            await sendWelcomeEmail({ to: user.email, name: user.name });
        } catch (emailError) {
            console.log('Welcome email failed:', emailError.message);
        }

        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const normalizeAdminEmail = (value) => String(value || '').trim().toLowerCase();

const fetchAdminAccount = async (email) => {
    const normalizedEmail = normalizeAdminEmail(email || process.env.ADMIN_EMAIL || 'foreverglobal.new@gmail.com');
    let admin = await adminModel.findOne({ email: normalizedEmail });

    if (!admin) {
        const defaultPassword = process.env.ADMIN_PASSWORD || 'forever9211';
        admin = await adminModel.create({
            email: normalizedEmail,
            password: await bcrypt.hash(defaultPassword, 10),
            passwordVersion: 1,
            lastPasswordUpdatedAt: new Date(),
        });
    }

    return admin;
};

// Admin Login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeAdminEmail(email);
        const admin = await fetchAdminAccount(normalizedEmail);

        if (normalizedEmail !== normalizeAdminEmail(admin.email)) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(String(password), admin.password);
        const envMatch = normalizedEmail === normalizeAdminEmail(process.env.ADMIN_EMAIL || 'foreverglobal.new@gmail.com')
            && String(password) === String(process.env.ADMIN_PASSWORD || 'forever9211');

        if (!isMatch && !envMatch) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({
            email: admin.email,
            passwordVersion: Number(admin.passwordVersion || 1),
        }, process.env.JWT_SECRET || 'fallback-secret');

        return res.json({ success: true, token, message: 'Login successful' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const forgotAdminPassword = async (req, res) => {
    try {
        const email = normalizeAdminEmail(req.body.email || process.env.ADMIN_EMAIL || 'foreverglobal.new@gmail.com');
        const admin = await fetchAdminAccount(email);

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        admin.resetOtp = otp;
        admin.resetOtpExpiry = Date.now() + 5 * 60 * 1000;
        await admin.save();

        await sendPasswordResetOtpEmail({ to: admin.email, otp, name: 'Admin' });

        return res.json({ success: true, message: 'OTP sent to your admin email.' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const verifyAdminPasswordResetOtp = async (req, res) => {
    try {
        const email = normalizeAdminEmail(req.body.email || process.env.ADMIN_EMAIL || 'foreverglobal.new@gmail.com');
        const { otp } = req.body;

        if (!otp) {
            return res.json({ success: false, message: 'OTP is required' });
        }

        const admin = await fetchAdminAccount(email);
        const now = Date.now();

        if (!admin.resetOtp || !admin.resetOtpExpiry || now > admin.resetOtpExpiry) {
            return res.json({ success: false, message: 'OTP expired. Please request a new one.' });
        }

        if (String(admin.resetOtp) !== String(otp).trim()) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        await admin.save();

        return res.json({ success: true, message: 'OTP verified. Please set a new password.' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const resetAdminPassword = async (req, res) => {
    try {
        const email = normalizeAdminEmail(req.body.email || process.env.ADMIN_EMAIL || 'foreverglobal.new@gmail.com');
        const { otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.json({ success: false, message: 'Email, OTP and new password are required' });
        }

        if (String(newPassword).length < 8) {
            return res.json({ success: false, message: 'Password must be at least 8 characters long.' });
        }

        const admin = await fetchAdminAccount(email);
        const now = Date.now();

        if (!admin.resetOtp || !admin.resetOtpExpiry || now > admin.resetOtpExpiry) {
            return res.json({ success: false, message: 'OTP expired. Please request a new one.' });
        }

        if (String(admin.resetOtp) !== String(otp).trim()) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        admin.password = await bcrypt.hash(String(newPassword), 10);
        admin.passwordVersion = Number(admin.passwordVersion || 1) + 1;
        admin.resetOtp = '';
        admin.resetOtpExpiry = 0;
        admin.lastPasswordUpdatedAt = new Date();
        await admin.save();

        return res.json({ success: true, message: 'Password updated successfully. All previous admin sessions have been logged out.' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

// Get Logged-in User Profile Data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId).select('-password');

        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, userData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Update Logged-in User Profile Data
const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, gender, dob } = req.body;

        // Prevent profile update if user is disabled or deleted
        const existing = await userModel.findById(userId);
        if (!existing) return res.json({ success: false, message: 'User not found' });
        if (existing.status === 'disabled') return res.json({ success: false, message: 'Your account is disabled. You cannot update profile.' });
        if (existing.status === 'deleted') return res.json({ success: false, message: 'Your account has been deleted and cannot be updated.' });

        const nextAddress = {
            ...(existing.address || {}),
            ...(address || {}),
        };

        if (!nextAddress.countryCode) {
            nextAddress.countryCode = '+1';
        }

        const cleanedPhone = typeof phone === 'string' ? phone.replace(/\D/g, '') : '';

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: { name, phone: cleanedPhone, address: nextAddress, gender, dob } },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Profile updated successfully", userData: updatedUser });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const updateUserLocation = async (req, res) => {
    try {
        const { userId, latitude, longitude, accuracy, saveAsLogin } = req.body;

        if (!userId) {
            return res.json({ success: false, message: 'User ID is required' });
        }

        const parsedLatitude = Number(latitude);
        const parsedLongitude = Number(longitude);
        const parsedAccuracy = accuracy === undefined || accuracy === null ? null : Number(accuracy);

        if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
            return res.json({ success: false, message: 'Valid latitude and longitude are required' });
        }

        if (parsedLatitude < -90 || parsedLatitude > 90 || parsedLongitude < -180 || parsedLongitude > 180) {
            return res.json({ success: false, message: 'Latitude and longitude values are out of range' });
        }

        const location = {
            latitude: parsedLatitude,
            longitude: parsedLongitude,
            accuracy: Number.isFinite(parsedAccuracy) ? parsedAccuracy : null,
            updatedAt: new Date(),
        };
        const loginLocation = {
            latitude: parsedLatitude,
            longitude: parsedLongitude,
            accuracy: Number.isFinite(parsedAccuracy) ? parsedAccuracy : null,
            savedAt: new Date(),
        };
        const update = {
            $set: { location, lastLocationUpdateAt: new Date() }
        };

        if (saveAsLogin === true || saveAsLogin === 'true') {
            const existingUser = await userModel.findById(userId).select('locationHistory');
            const history = existingUser?.locationHistory || [];
            update.$set.locationHistory = history.length >= 5 ? [loginLocation] : [...history, loginLocation];
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, update, { new: true, runValidators: true }).select('-password');

        if (!updatedUser) {
            return res.json({ success: false, message: 'User not found' });
        }

        return res.json({
            success: true,
            message: 'Location updated successfully',
            userData: updatedUser,
        });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

// --- ADMIN CONTROLLERS ---

// Get All Users List for Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password');
        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Toggle User Status (Disable / Enable)
const toggleUserStatus = async (req, res) => {
    try {
        const { userId, status } = req.body;
        await userModel.findByIdAndUpdate(userId, { status });
        res.json({ success: true, message: `User status updated to ${status}` });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Delete User Permanently
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.json({ success: false, message: 'User ID is required' });
        }

        const deletedUser = await userModel.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.json({ success: false, message: 'User not found' });
        }

        await orderModel.deleteMany({ userId });
        await cancelledOrderModel.deleteMany({ userId });

        res.json({ success: true, message: 'User permanently deleted from database' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Job Application Handler
const applyJob = async (req, res) => {
    try {
        const { firstName, lastName, email, contact, state, city, address, aadharNumber, whyJoin } = req.body;
        
        // Validation
        if (!firstName || !lastName || !email || !contact || !state || !city || !address || !aadharNumber || !whyJoin) {
            return res.json({ success: false, message: 'All fields are required' });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({ success: false, message: 'Invalid email address' });
        }

        // Get resume filename if uploaded. Keep this serverless-safe.
        const resumeFileName = req.file ? req.file.originalname : 'No resume uploaded';
        const resumeBuffer = req.file ? req.file.buffer : null;
        const resumeMimeType = req.file ? req.file.mimetype : null;

        // Send email to admin
        try {
            await sendJobApplicationToAdmin({
                firstName,
                lastName,
                email,
                contact,
                state,
                city,
                address,
                aadharNumber,
                whyJoin,
                resumeFileName,
                resumeBuffer,
                resumeMimeType
            });
        } catch (adminEmailError) {
            console.log('Failed to send admin email:', adminEmailError.message);
        }

        // Send confirmation email to applicant
        try {
            await sendJobApplicationEmail({
                to: email,
                firstName,
                lastName
            });
        } catch (applicantEmailError) {
            console.log('Failed to send applicant email:', applicantEmailError.message);
        }

        res.json({ success: true, message: 'Application submitted successfully! We will review your profile.' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


export { 
    loginUser,
    verifyLoginOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    saveCameraCapture,
    registerUser,
    adminLogin,
    forgotAdminPassword,
    verifyAdminPasswordResetOtp,
    resetAdminPassword,
    getProfile,
    updateProfile,
    updateUserLocation,
    getAllUsers, 
    toggleUserStatus, 
    deleteUser,
    applyJob
};
