import express from 'express';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Request to borrow a book
router.post('/request/:bookId', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId)
      .populate('owner', 'name email');
      
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if book is available
    if (!book.available) {
      return res.status(400).json({ message: 'Book is not available for borrowing' });
    }
    
    // Check if user is trying to borrow their own book
    if (book.owner._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot borrow your own book' });
    }
    
    // Mark book as unavailable
    book.available = false;
    book.currentBorrower = req.user.id;
    
    // Add borrowing record
    const borrowRecord = {
      borrower: req.user.id,
      borrowDate: new Date(),
      returnDate: null,
      returned: false
    };
    
    book.borrowingHistory.push(borrowRecord);
    await book.save();
    
    // You could implement notification to the owner here
    
    res.status(200).json({ 
      message: 'Book borrowed successfully',
      book
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Return a borrowed book
router.post('/return/:bookId', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if user is the current borrower
    if (!book.currentBorrower || book.currentBorrower.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not currently borrowing this book' });
    }
    
    // Mark book as available again
    book.available = true;
    book.currentBorrower = null;
    
    // Update the borrowing record
    const lastBorrowingIndex = book.borrowingHistory.length - 1;
    if (lastBorrowingIndex >= 0) {
      book.borrowingHistory[lastBorrowingIndex].returnDate = new Date();
      book.borrowingHistory[lastBorrowingIndex].returned = true;
      
      // Optional: Add borrower rating if provided
      const { borrowerRating, borrowerComment } = req.body;
      if (borrowerRating) {
        book.borrowingHistory[lastBorrowingIndex].borrowerRating = Number(borrowerRating);
        book.borrowingHistory[lastBorrowingIndex].borrowerComment = borrowerComment || '';
      }
    }
    
    await book.save();
    
    // You could implement notification to the owner here
    
    res.status(200).json({ 
      message: 'Book returned successfully',
      book
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all books borrowed by the current user
router.get('/my-borrowed', auth, async (req, res) => {
  try {
    const borrowedBooks = await Book.find({ currentBorrower: req.user.id })
      .populate('owner', 'name email location avatar');
      
    res.json(borrowedBooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get borrowing history for the current user
router.get('/my-history', auth, async (req, res) => {
  try {
    const books = await Book.find({
      'borrowingHistory.borrower': req.user.id
    })
    .populate('owner', 'name email location avatar');
    
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all books lent by the current user
router.get('/my-lent', auth, async (req, res) => {
  try {
    const lentBooks = await Book.find({ 
      owner: req.user.id,
      available: false,
      currentBorrower: { $ne: null }
    })
    .populate('currentBorrower', 'name email location avatar');
    
    res.json(lentBooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept a return (for book owners)
router.post('/accept-return/:bookId', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if user is the book owner
    if (book.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not the owner of this book' });
    }
    
    // Check if the book is marked as returned
    const lastBorrowingIndex = book.borrowingHistory.length - 1;
    if (lastBorrowingIndex < 0 || !book.borrowingHistory[lastBorrowingIndex].returned) {
      return res.status(400).json({ message: 'This book has not been marked as returned' });
    }
    
    // Confirm the return
    book.borrowingHistory[lastBorrowingIndex].returnConfirmed = true;
    book.available = true;
    book.currentBorrower = null;
    
    await book.save();
    
    res.status(200).json({ 
      message: 'Return accepted successfully',
      book
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get active borrowing requests for owner's books
router.get('/my-requests', auth, async (req, res) => {
  try {
    const books = await Book.find({ 
      owner: req.user.id,
      available: false,
      'borrowingHistory.returned': false
    })
    .populate('currentBorrower', 'name email location avatar');
    
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router; 