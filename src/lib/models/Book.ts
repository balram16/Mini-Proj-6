import mongoose from 'mongoose';

export interface IBook {
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  price: number;
  location: string;
  owner: mongoose.Types.ObjectId;
  status: 'available' | 'borrowed' | 'reserved';
  borrower?: mongoose.Types.ObjectId;
  dueDate?: Date;
  tags: string[];
  rating: number;
  reviews: {
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    date: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new mongoose.Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair', 'poor'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'borrowed', 'reserved'],
      default: 'available',
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: {
      type: Date,
    },
    tags: [{
      type: String,
    }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
bookSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });

// Index for filtering
bookSchema.index({ category: 1, condition: 1, status: 1, location: 1 });

export const Book = mongoose.models.Book || mongoose.model<IBook>('Book', bookSchema); 