import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';

// App Config
const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cors());

// Api Endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

// Root Route (Isse / par 500 Error aana band ho jayega)
app.get('/', (req, res) => {
    res.send("API Working");
});

const startServer = async () => {
    try {
        await connectDB();
        connectCloudinary();
        app.listen(port, () => console.log('Server started on PORT : ' + port));
    } catch (error) {
        console.log('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
