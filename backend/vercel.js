// Serverless function wrapper for Express backend on Vercel
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import borrowRoutes from "./routes/borrowRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

// Initialize express app
const app = express();
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Use environment variable for frontend URL or allow all in serverless
  credentials: true, // Allow cookies and credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/payments", paymentRoutes);

// Basic route for testing
app.get("/api", (req, res) => {
  res.send("BookLendiverse API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Don't exit process in serverless environment
    // Instead, let the function return an error
  }
};

// Connect to MongoDB if not already connected
if (mongoose.connection.readyState !== 1) {
  connectDB();
}

// Export the Express API for Vercel
export default app; 