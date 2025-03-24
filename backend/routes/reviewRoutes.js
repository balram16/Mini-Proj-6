import express from 'express';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all reviews for a book
router.get('/book/:bookId', async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId)
      .populate('reviews.user', 'name avatar');
      
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book.reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a review to a book
router.post('/book/:bookId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if user already reviewed this book
    const alreadyReviewed = book.reviews.find(
      review => review.user.toString() === req.user.id
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Book already reviewed' });
    }
    
    const review = {
      user: req.user.id,
      rating: Number(rating),
      comment,
      date: Date.now()
    };
    
    book.reviews.push(review);
    
    // Update book rating (average of all reviews)
    book.rating = book.reviews.reduce((acc, item) => item.rating + acc, 0) / book.reviews.length;
    
    await book.save();
    
    const updatedBook = await Book.findById(req.params.bookId)
      .populate('reviews.user', 'name avatar');
      
    res.status(201).json(updatedBook.reviews);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a review
router.put('/book/:bookId/review/:reviewId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Find review index
    const reviewIndex = book.reviews.findIndex(
      review => review._id.toString() === req.params.reviewId
    );
    
    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the reviewer
    if (book.reviews[reviewIndex].user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    // Update review
    book.reviews[reviewIndex].rating = Number(rating);
    book.reviews[reviewIndex].comment = comment;
    book.reviews[reviewIndex].date = Date.now();
    
    // Update book rating
    book.rating = book.reviews.reduce((acc, item) => item.rating + acc, 0) / book.reviews.length;
    
    await book.save();
    
    const updatedBook = await Book.findById(req.params.bookId)
      .populate('reviews.user', 'name avatar');
      
    res.json(updatedBook.reviews);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a review
router.delete('/book/:bookId/review/:reviewId', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Find review index
    const reviewIndex = book.reviews.findIndex(
      review => review._id.toString() === req.params.reviewId
    );
    
    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the reviewer or book owner
    if (book.reviews[reviewIndex].user.toString() !== req.user.id && 
        book.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    // Remove review
    book.reviews.splice(reviewIndex, 1);
    
    // Update book rating
    if (book.reviews.length > 0) {
      book.rating = book.reviews.reduce((acc, item) => item.rating + acc, 0) / book.reviews.length;
    } else {
      book.rating = 0;
    }
    
    await book.save();
    
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a rating for a user (after borrowing a book)
router.post('/user/:userId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the rater has borrowed from this user
    // This could be enhanced with more validation
    
    const newRating = {
      user: req.user.id,
      rating: Number(rating),
      comment,
      date: Date.now()
    };
    
    user.ratings.push(newRating);
    await user.save();
    
    const updatedUser = await User.findById(req.params.userId)
      .populate('ratings.user', 'name avatar');
      
    res.status(201).json(updatedUser.ratings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router; 