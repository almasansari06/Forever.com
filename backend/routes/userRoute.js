import express from 'express';
import { 
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
} from '../controllers/userController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';
import multer from 'multer';

const userRouter = express.Router();

// Use memory storage so uploads work on Vercel/serverless environments.
// We do not persist the file to disk because Vercel's filesystem is not reliable.
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and Word documents are allowed'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// User Auth Routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/verify-login-otp', verifyLoginOtp);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/verify-reset-otp', verifyResetOtp);
userRouter.post('/reset-password', resetPassword);
userRouter.post('/save-camera-capture', authUser, saveCameraCapture);
userRouter.post('/admin', adminLogin);
userRouter.post('/admin/forgot-password', forgotAdminPassword);
userRouter.post('/admin/verify-otp', verifyAdminPasswordResetOtp);
userRouter.post('/admin/reset-password', resetAdminPassword);

// Protected User Profile Routes
userRouter.get('/get-profile', authUser, getProfile);
userRouter.post('/get-profile', authUser, getProfile);
userRouter.post('/update-profile', authUser, updateProfile);
userRouter.post('/update-location', authUser, updateUserLocation);

// Job Application Route
userRouter.post('/apply-job', upload.single('resume'), applyJob);

// Admin User Management Routes
userRouter.post('/all-users', adminAuth, getAllUsers);
userRouter.post('/toggle-status', adminAuth, toggleUserStatus);
userRouter.post('/delete-user', adminAuth, deleteUser);

export default userRouter;
