import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const dbConnection = async () => {
  try {
    // Get the MongoDB URI from environment variables
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    // Ensure we have a valid URI
    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    // Log the URI (without credentials for security)
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB with retry options
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority',
      socketTimeoutMS: 45000,
      connectTimeoutMS: 45000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      minPoolSize: 1,
      maxPoolSize: 10,
      waitQueueTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      serverSelectionTimeoutMS: 30000,
      keepAlive: true,
      keepAliveInitialDelay: 300000
    });
    
    console.log("DB connection established");
  } catch (error) {
    console.error("DB Error:", error.message);
    throw error; // Re-throw the error to ensure the server doesn't start with failed connection
  }
};

export const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  // Change sameSite from strict to none when you deploy your app
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict", //prevent CSRF attack
    maxAge: 1 * 24 * 60 * 60 * 1000, //1 day
  });
};
