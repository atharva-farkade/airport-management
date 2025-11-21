import mongoose from 'mongoose';
import { DB_Name } from '../constants.js';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`);
        // console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host} DB NAME: ${connectionInstance.connection.name}`);
        console.log("MongoDB connected successfully");
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
    
  }
}
export default connectDB;