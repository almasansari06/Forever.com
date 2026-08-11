import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Helper function to create JWT Token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

// User Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        // Check if user account is disabled or deleted
        if (user.status === 'disabled') {
            return res.json({ success: false, message: "Your account has been disabled by the administrator. You cannot perform actions. Please contact support." });
        }
        if (user.status === 'deleted') {
            return res.json({ success: false, message: "Your account has been deleted by the administrator and cannot be used. You cannot register a new account with this email." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// User Register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await userModel.findOne({ email });
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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        });

        const user = await newUser.save();
        const token = createToken(user._id);

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

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: { name, phone, address, gender, dob } },
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
        // Soft-delete: mark as deleted so we can prevent re-registration with same email
        await userModel.findByIdAndUpdate(userId, { status: 'deleted', deletedAt: Date.now() });
        res.json({ success: true, message: "User marked as deleted" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


export { 
    loginUser, 
    registerUser, 
    adminLogin, 
    getProfile, 
    updateProfile,
    getAllUsers, 
    toggleUserStatus, 
    deleteUser 
};
