import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "booklendiverse_jwt_secret_key_2024";

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    console.log('Verifying token:', token);
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('Decoded token in verifyToken:', decoded);
    
    // Handle both token structures
    req.user = { 
      id: decoded.id || decoded.userId 
    };
    console.log('User assigned in request:', req.user);
    
    next();
  } catch (err) {
    console.error('Token verification error in verifyToken:', err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

// 🟢 SIGNUP Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ 
      name, 
      email, 
      password,
      location: location || {},
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      role: "user"
    });
    
    await newUser.save();
    
    // Generate JWT Token with consistent structure (both id and userId)
    const token = jwt.sign({ id: newUser._id, userId: newUser._id }, SECRET_KEY, { expiresIn: "1d" });
    
    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: {
        _id: newUser._id,
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error in signup", error: error.message });
  }
});

// 🔵 LOGIN Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT Token with consistent structure (both id and userId)
    const token = jwt.sign({ id: user._id, userId: user._id }, SECRET_KEY, { expiresIn: "1d" });

    res.json({ 
      message: "Login successful", 
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error in login", error: error.message });
  }
});

// 🟣 Get current user data (requires token)
router.get('/me', verifyToken, async (req, res) => {
  try {
    // The verifyToken middleware already adds the user id to req
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('books', 'title author description image price condition') // Populate books with selected fields
      .populate('bookmarks', 'title author description image price condition'); // Populate bookmarks with selected fields
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensure _id field is available in the response
    const userData = user.toObject();
    if (!userData._id && userData.id) {
      userData._id = userData.id;
    }
    
    res.json(userData);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 🟠 Update user profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, email, phone, location, bio, upiId } = req.body;
    
    // Find user by id
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    
    // Handle location properly based on schema
    if (location) {
      // If location is a string, update the address part
      if (typeof location === 'string') {
        user.location = {
          address: location,
          city: user.location?.city || '',
          state: user.location?.state || '',
          coordinates: user.location?.coordinates || { lat: 0, lng: 0 }
        };
      } else if (typeof location === 'object') {
        // If location is an object, update accordingly
        user.location = {
          address: location.address || user.location?.address || '',
          city: location.city || user.location?.city || '',
          state: location.state || user.location?.state || '',
          coordinates: location.coordinates || user.location?.coordinates || { lat: 0, lng: 0 }
        };
      }
    }
    
    if (bio) user.bio = bio;
    if (upiId) user.upiId = upiId;
    
    await user.save();
    
    // Return user without password
    const userData = await User.findById(user._id).select('-password');
    res.json(userData);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
});

// 🔴 Get user by ID (public profile)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -email")
      .populate("books");
      
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🔵 Logout user (invalidate token on client side)
router.post('/logout', (req, res) => {
  // In a stateful server we might invalidate the token
  // Here we just return success - actual logout happens on client
  res.json({ message: 'Logged out successfully' });
});

export default router;
