import mongoose from 'mongoose';
import '../models/index.js';
import { env } from './env.js';

export async function connectDatabase() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}
