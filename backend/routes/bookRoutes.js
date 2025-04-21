import express from 'express';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const { genre, available, minRating, maxPrice, search, sort } = req.query;
    
    // Build query
    let query = {};
    
    if (genre) {
      query.genre = { $in: Array.isArray(genre) ? genre : [genre] };
    }
    
    if (available === 'true') {
      query.available = true;
    }
    
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }
    
    if (maxPrice) {
      query.rentPrice = { $lte: Number(maxPrice) };
    }
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // Sort options
    let sortOption = {};
    if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'priceAsc') {
      sortOption = { rentPrice: 1 };
    } else if (sort === 'priceDesc') {
      sortOption = { rentPrice: -1 };
    } else if (sort === 'popularity') {
      sortOption = { popularityScore: -1 };
    } else {
      // Default sort
      sortOption = { createdAt: -1 };
    }
    
    const books = await Book.find(query)
      .populate('owner', 'name location avatar upiId')
      .sort(sortOption);
      
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('owner', 'name email location avatar ratings upiId')
      .populate('reviews.user', 'name avatar')
      .populate('currentBorrower', 'name avatar')
      .populate('borrowingHistory.borrower', 'name avatar');
      
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Increment popularity score for each view
    book.popularityScore += 1;
    await book.save();
    
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new book
router.post('/', auth, async (req, res) => {
  try {
    const { 
      title, author, description, price, rentPrice, transactionType, 
      condition, genre, coverImage, location, language 
    } = req.body;
    
    if (!title || !author || !description) {
      return res.status(400).json({ message: 'Please provide title, author and description' });
    }
    
    // Set the correct price based on transaction type
    const bookData = {
      title,
      author,
      description,
      condition: condition || 'Good',
      genre: genre || ['Fiction'],
      coverImage: coverImage || '',
      location: location || {},
      language: language || 'English',
      transactionType: transactionType || 'rent',
      available: true,
      owner: req.user.id
    };
    
    // Set price based on transaction type
    if (transactionType === 'buy') {
      bookData.price = price || 0;
      bookData.rentPrice = 0;
    } else {
      bookData.rentPrice = rentPrice || price || 0;
      bookData.price = 0;
    }
    
    const book = new Book(bookData);
    await book.save();
    
    // Add book to user's books array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { books: book._id } }
    );
    
    res.status(201).json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a book (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if user is the owner
    if (book.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }
    
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('owner', 'name location avatar upiId');
    
    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a book (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if user is the owner
    if (book.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }
    
    // Remove book from user's books array
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { books: req.params.id }
    });
    
    await Book.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a review to a book
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const book = await Book.findById(req.params.id);
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
    
    const updatedBook = await Book.findById(req.params.id)
      .populate('reviews.user', 'name avatar');
      
    res.status(201).json(updatedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get books by owner
router.get('/user/:userId', async (req, res) => {
  try {
    const books = await Book.find({ owner: req.params.userId })
      .populate('owner', 'name location avatar upiId');
      
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get recommended books
router.get('/recommendations/:userId', async (req, res) => {
  try {
    // Get user's bookmarks and books they've borrowed
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find books with similar genres to user's bookmarks
    const userBookmarks = await Book.find({ _id: { $in: user.bookmarks } });
    const genres = userBookmarks.flatMap(book => book.genre);
    
    // Get recommended books
    const recommendations = await Book.find({
      genre: { $in: genres },
      _id: { $nin: user.bookmarks }, // Exclude already bookmarked books
      owner: { $ne: req.params.userId }, // Exclude user's own books
      available: true
    })
    .populate('owner', 'name location avatar')
    .sort({ rating: -1 })
    .limit(10);
    
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle bookmark for a book
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    const user = await User.findById(req.user.id);
    
    // Check if book is already bookmarked
    const isBookmarked = user.bookmarks.includes(req.params.id);
    
    if (isBookmarked) {
      // Remove bookmark
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { bookmarks: req.params.id }
      });
      res.json({ message: 'Bookmark removed', isBookmarked: false });
    } else {
      // Add bookmark
      await User.findByIdAndUpdate(req.user.id, {
        $push: { bookmarks: req.params.id }
      });
      res.json({ message: 'Book bookmarked', isBookmarked: true });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
