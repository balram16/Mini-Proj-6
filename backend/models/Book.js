import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  genre: [{
    type: String,
    required: true
  }],
  publishedYear: {
    type: Number
  },
  isbn: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Very Good', 'Good', 'Acceptable', 'Poor'],
    default: 'Good'
  },
  language: {
    type: String,
    default: 'English'
  },
  pageCount: {
    type: Number
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
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  rentPrice: {
    type: Number,
    required: true
  },
  depositAmount: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  popularityScore: {
    type: Number,
    default: 0
  },
  currentBorrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  borrowingHistory: [{
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    borrowDate: Date,
    returnDate: Date,
    returned: {
      type: Boolean,
      default: false
    },
    borrowerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    borrowerComment: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  transactionType: {
    type: String,
    enum: ["rent", "buy"],
    default: "rent"
  },
  price: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Virtual for average rating
bookSchema.virtual('avgRating').get(function() {
  if (this.reviews.length === 0) return 0;
  
  const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

// Virtual for number of times borrowed
bookSchema.virtual('borrowCount').get(function() {
  return this.borrowingHistory.length;
});

const Book = mongoose.model('Book', bookSchema);
export default Book;
