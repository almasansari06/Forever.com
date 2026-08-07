import express from 'express';
import { 
    loginUser, 
    registerUser, 
    adminLogin, 
    getProfile, 
    updateProfile,
    getAllUsers, 
    toggleUserStatus, 
    deleteUser 
} from '../controllers/userController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

// User Auth Routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);

// Protected User Profile Routes
userRouter.get('/get-profile', authUser, getProfile);
userRouter.post('/get-profile', authUser, getProfile);
userRouter.post('/update-profile', authUser, updateProfile);

// Admin User Management Routes
userRouter.post('/all-users', adminAuth, getAllUsers);
userRouter.post('/toggle-status', adminAuth, toggleUserStatus);
userRouter.post('/delete-user', adminAuth, deleteUser);

export default userRouter;
