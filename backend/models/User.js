import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  phone: {
    type: String,
    default: ""
  },
  avatar: { 
    type: String,
    default: "https://api.dicebear.com/7.x/avataaars/svg" 
  },
  bio: {
    type: String,
    default: ""
  },
  location: {
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    }
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  books: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book"
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book"
  }],
  borrowedBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book"
  }],
  upiId: {
    type: String,
    default: ""
  },
  transactionCount: {
    type: Number,
    default: 0
  },
  badges: [{
    type: String,
    enum: [
      "new_user", 
      "bronze_lender", 
      "silver_lender", 
      "gold_lender", 
      "platinum_lender",
      "trusted_user",
      "book_enthusiast",
      "book_worm",
      "book_collector"
    ]
  }],
  registeredAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add a method to award badges based on transaction count
UserSchema.methods.updateBadges = function() {
  const count = this.transactionCount;
  const currentBadges = new Set(this.badges);
  
  // New user badge - awarded upon registration
  if (!currentBadges.has('new_user')) {
    currentBadges.add('new_user');
  }
  
  // Bronze lender badge - awarded after 5 transactions
  if (count >= 5 && !currentBadges.has('bronze_lender')) {
    currentBadges.add('bronze_lender');
  }
  
  // Silver lender badge - awarded after 15 transactions
  if (count >= 15 && !currentBadges.has('silver_lender')) {
    currentBadges.add('silver_lender');
  }
  
  // Gold lender badge - awarded after 30 transactions
  if (count >= 30 && !currentBadges.has('gold_lender')) {
    currentBadges.add('gold_lender');
  }
  
  // Platinum lender badge - awarded after 50 transactions
  if (count >= 50 && !currentBadges.has('platinum_lender')) {
    currentBadges.add('platinum_lender');
  }
  
  // Update badges array
  this.badges = Array.from(currentBadges);
};

// Pre-save hook to check and award badges
UserSchema.pre('save', function(next) {
  if (this.isModified('transactionCount')) {
    this.updateBadges();
  }
  next();
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Virtual for avgRating
UserSchema.virtual('avgRating').get(function() {
  if (this.ratings.length === 0) return 0;
  
  const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

const User = mongoose.model("User", UserSchema);
export default User;
