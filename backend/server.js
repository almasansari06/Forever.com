import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import productTypeRouter from './routes/productTypeRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import couponRouter from './routes/couponRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';

// App Config
const app = express();
const port = process.env.PORT || 4000;

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS setup (allowing all origins & headers safely)
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

// Middlewares
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database & Cloudinary Connection Middleware for Serverless
let isConnected = false;
let connectionPromise;
app.use(async (req, res, next) => {
    if (isConnected) return next();

    try {
        connectionPromise ??= connectDB().then(() => {
            connectCloudinary();
            isConnected = true;
        });
        await connectionPromise;
        return next();
    } catch (error) {
        connectionPromise = undefined;
        console.error('Failed to initialize backend:', error.message);
        return res.status(503).json({
            success: false,
            message: 'Database unavailable. Please check the backend MongoDB connection.',
        });
    }
});

// Root Route
app.get('/', (req, res) => {
    res.send('API Working');
});

// Api Endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/product-type', productTypeRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/review', reviewRouter);
app.use('/api/coupon', couponRouter);

if (!process.env.VERCEL) {
    app.listen(port, () => console.log('Server started on PORT : ' + port));
}

export default app;