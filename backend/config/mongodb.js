import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;

    mongoose.connection.on('connected', () => {
        console.log('MongoDB connected');
    });

    mongoose.connection.on('error', (err) => {
        console.log('MongoDB connection error:', err.message);
    });

    if (mongoUri && mongoUri.startsWith('mongodb')) {
        try {
            await mongoose.connect(mongoUri);
            return;
        } catch (error) {
            console.log('Remote MongoDB connection failed:', error.message);
        }
    } else {
        console.log('MongoDB URI not configured. Trying local fallback.');
    }

    try {
        mongoServer = await MongoMemoryServer.create();
        const localUri = await mongoServer.getUri();
        await mongoose.connect(localUri);
        console.log('MongoDB connected to local memory server');
    } catch (error) {
        console.log('Local MongoDB fallback failed:', error.message);
    }
};

export default connectDB;