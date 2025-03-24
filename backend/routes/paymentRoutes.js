import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import { auth } from "../middleware/auth.js";
import User from "../models/User.js";
import Book from "../models/Book.js";
import Transaction from "../models/Transaction.js";

dotenv.config();

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyId',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestKeySecret',
});

// Create a new payment order
router.post("/create-order", auth, async (req, res) => {
  try {
    const { bookId, duration } = req.body;
    
    // Validate inputs
    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }
    
    // Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    // Check if book is available
    if (!book.available) {
      return res.status(400).json({ message: "Book is not available for transaction" });
    }
    
    // Find the seller (book owner)
    const seller = await User.findById(book.owner);
    if (!seller) {
      return res.status(404).json({ message: "Book owner not found" });
    }
    
    // Check if seller has a UPI ID
    if (!seller.upiId) {
      return res.status(400).json({ message: "Book owner does not have a payment method set up" });
    }
    
    // Calculate amount based on transaction type and duration
    let amount = 0;
    if (book.transactionType === "rent") {
      // For rent, multiply by days
      const days = duration || 7; // Default to 7 days if duration not specified
      amount = book.rentPrice * days;
    } else {
      // For purchase
      amount = book.price;
    }
    
    // Create a Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise (smallest Indian currency unit)
      currency: "INR",
      receipt: `receipt_${new Date().getTime()}_${req.user.id}`,
      payment_capture: 1, // Auto capture payment
      notes: {
        bookId: bookId,
        sellerId: book.owner.toString(),
        buyerId: req.user.id,
        transactionType: book.transactionType,
        duration: duration || null,
        sellerUpi: seller.upiId
      }
    };
    
    // Create the order
    const order = await razorpay.orders.create(options);
    
    // Create a pending transaction record
    const transaction = new Transaction({
      buyer: req.user.id,
      seller: book.owner,
      book: bookId,
      amount: amount,
      transactionType: book.transactionType,
      paymentId: order.id,
      status: "pending"
    });
    
    await transaction.save();
    
    res.status(200).json({
      orderId: order.id,
      amount: amount,
      currency: "INR",
      transactionId: transaction._id,
      ticketId: transaction.ticketId,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyId',
      sellerUpi: seller.upiId
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Verify payment callback
router.post("/verify-payment", auth, async (req, res) => {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      transactionId
    } = req.body;
    
    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'YourTestKeySecret')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    
    const isSignatureValid = generatedSignature === razorpay_signature;
    
    if (!isSignatureValid) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }
    
    // Find the transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    // Update transaction status
    transaction.status = "completed";
    transaction.paymentId = razorpay_payment_id;
    await transaction.save();
    
    // Update book availability
    const book = await Book.findById(transaction.book);
    if (book) {
      book.available = false;
      await book.save();
    }
    
    // Increment transaction count for buyer
    const buyer = await User.findById(transaction.buyer);
    if (buyer) {
      buyer.transactionCount += 1;
      await buyer.save();
    }
    
    // Increment transaction count for seller
    const seller = await User.findById(transaction.seller);
    if (seller) {
      seller.transactionCount += 1;
      await seller.save();
    }
    
    res.status(200).json({ 
      success: true, 
      ticketId: transaction.ticketId,
      message: "Payment verified and transaction completed successfully" 
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user transaction history
router.get("/history", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { buyer: req.user.id },
        { seller: req.user.id }
      ]
    })
    .populate("book", "title author coverImage transactionType")
    .populate("buyer", "name email")
    .populate("seller", "name email")
    .sort({ createdAt: -1 });
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get transaction details by ticket ID
router.get("/ticket/:ticketId", auth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const transaction = await Transaction.findOne({ ticketId })
      .populate("book", "title author coverImage transactionType price rentPrice")
      .populate("buyer", "name email")
      .populate("seller", "name email upiId");
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    // Security check - only allow the buyer or seller to view the transaction
    if (transaction.buyer._id.toString() !== req.user.id && 
        transaction.seller._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this transaction" });
    }
    
    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin route to get all transactions
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if the user is an admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Fetch all transactions with populated fields
    const transactions = await Transaction.find()
      .populate('book', 'title author coverImage transactionType price')
      .populate('seller', 'name email')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router; 