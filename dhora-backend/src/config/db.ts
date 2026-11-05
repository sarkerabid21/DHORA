import mongoose from 'mongoose';
import { ENV } from './env';

// Disable buffering so requests do not hang 10 seconds if MongoDB is offline
mongoose.set('bufferCommands', false);

export const connectDB = async (): Promise<boolean> => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.warn(`[Database Warning] MongoDB connection failed: ${error.message}`);
    console.warn(`[Database Notice] Application operating with in-memory DB fallback for seamless offline testing.`);
    return false;
  }
};
