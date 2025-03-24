import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transactionType: {
    type: String,
    enum: ["rent", "buy"],
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending"
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    // Only required for rent transactions
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Generate a unique ticket ID before saving
transactionSchema.pre('save', function(next) {
  if (!this.ticketId) {
    // Generate a unique ticket ID using a combination of user ID, book ID, and timestamp
    const timestamp = new Date().getTime().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.ticketId = `BLD-${timestamp}-${randomStr}`;
  }
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction; 