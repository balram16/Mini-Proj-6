import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "booklendiverse_jwt_secret_key_2024";

export const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    console.log('Received token:', token);
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Add user to request with consistent id field
    // Handle both { id: ... } and { userId: ... } structures
    req.user = { 
      id: decoded.id || decoded.userId 
    };
    
    console.log('User in request:', req.user);
    
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin middleware
export const adminAuth = async (req, res, next) => {
  try {
    // First run the regular auth middleware
    auth(req, res, async () => {
      // Get the user
      const user = await User.findById(req.user.id);
      
      // Check if user is an admin
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      
      next();
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 