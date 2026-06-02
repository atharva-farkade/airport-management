import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
  try {
    // Remove trailing slash from MONGODB_URI if it exists
    const mongoUri = process.env.MONGODB_URI.replace(/\/$/, '');
    const connectionInstance = await mongoose.connect(`${mongoUri}/${DB_NAME}`);
    // console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host} DB NAME: ${connectionInstance.connection.name}`);
    console.log("MongoDB connected successfully");

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);

  }
}
export default connectDB;