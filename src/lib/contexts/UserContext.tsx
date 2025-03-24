'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string | {
    address?: string;
    city?: string;
    state?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  bio?: string;
  avatar?: string;
  paymentMethods?: PaymentMethodData[];
  books?: BookData[];
  bookmarks?: string[];
  borrowedBooks?: string[];
  upiId?: string;
  transactionCount?: number;
  badges?: string[];
}

interface PaymentMethodData {
  id: string;
  type: string;
  last4: string;
  isDefault: boolean;
}

interface BookData {
  _id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  genre: string[];
  rating?: number;
  rentPrice?: number;
  price?: number;
  condition: string;
  owner: string;
  available: boolean;
  createdAt: string;
  likes: string[];
  comments: any[];
}

interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: string;
  currency: string;
}

interface UserContextType {
  user: IUser | null;
  settings: UserSettings | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ redirectTo?: string }>;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<IUser>) => Promise<IUser>;
  updateSettings: (data: Partial<UserSettings>) => Promise<UserSettings>;
  addPaymentMethod: (paymentMethod: PaymentMethodData) => Promise<void>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  addBook: (book: BookData) => Promise<BookData>;
  getBooks: () => BookData[];
  getBookById: (id: string) => BookData | undefined;
  deleteBook: (id: string) => Promise<void>;
  updateBook: (id: string, data: Partial<BookData>) => Promise<BookData>;
  toggleBookmark: (bookId: string) => Promise<boolean>;
}

// Create mock books for testing
const mockBooks: BookData[] = [
  {
    _id: 'book-1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A classic novel about the American Dream set in the Jazz Age.',
    coverImage: 'https://source.unsplash.com/random/400x600/?book,gatsby',
    genre: ['Fiction', 'Classic'],
    rating: 4.5,
    rentPrice: 5.99,
    condition: 'Good',
    owner: '2', // Different user
    available: true,
    createdAt: '2023-01-15T12:00:00Z',
    likes: [],
    comments: []
  },
  {
    _id: 'book-2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'A powerful story about racial injustice and moral growth in the American South.',
    coverImage: 'https://source.unsplash.com/random/400x600/?book,mockingbird',
    genre: ['Fiction', 'Classic'],
    rating: 4.8,
    rentPrice: 6.99,
    condition: 'Like New',
    owner: '2', // Different user
    available: true,
    createdAt: '2023-02-20T15:30:00Z',
    likes: [],
    comments: []
  },
  {
    _id: 'book-3',
    title: 'Harry Potter and the Philosopher\'s Stone',
    author: 'J.K. Rowling',
    description: 'The first book in the Harry Potter series following the young wizard\'s adventures.',
    coverImage: 'https://source.unsplash.com/random/400x600/?book,harry-potter',
    genre: ['Fantasy', 'Young Adult'],
    rating: 4.7,
    rentPrice: 7.99,
    condition: 'Good',
    owner: '2', // Different user
    available: true,
    createdAt: '2023-03-10T09:45:00Z',
    likes: [],
    comments: []
  }
];

// Create a mock user for testing
const mockUser: IUser = {
  _id: '1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser',
  bio: 'I love reading and sharing books!',
  location: 'New York, NY',
  phone: '+1234567890',
  books: [],
  bookmarks: [],
  borrowedBooks: [],
  borrowedBooks: []
};

const mockSettings: UserSettings = {
  emailNotifications: true,
  smsNotifications: false,
  language: 'en',
  currency: 'USD',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allBooks, setAllBooks] = useState<BookData[]>(mockBooks);
  const router = useRouter();

  // Function to load user data from token
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('booklendiverse_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Make API call to get user data
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // If unauthorized, clear storage
        if (response.status === 401) {
          localStorage.removeItem('booklendiverse_token');
          localStorage.removeItem('booklendiverse_user');
        }
        setIsLoading(false);
        return;
      }

      const userData = await response.json();
      setUser(userData);
      
      // Could also fetch settings from API if needed
      setSettings(mockSettings);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user on initial mount
  useEffect(() => {
    loadUser();
  }, []);

  // Load books from localStorage
  useEffect(() => {
    const storedBooks = localStorage.getItem('booklendiverse_books');
    if (storedBooks) {
      try {
        const parsedBooks = JSON.parse(storedBooks);
        setAllBooks([...mockBooks, ...parsedBooks]);
      } catch (error) {
        console.error('Error parsing stored books:', error);
      }
    }
  }, []);

  // Save books to localStorage whenever they change
  useEffect(() => {
    if (allBooks.length > mockBooks.length) {
      const booksToStore = allBooks.filter(
        book => !mockBooks.some(mockBook => mockBook._id === book._id)
      );
      localStorage.setItem('booklendiverse_books', JSON.stringify(booksToStore));
    }
  }, [allBooks]);

  const login = async (email: string, password: string) => {
    try {
      // Make a real API call to the backend
      const response = await fetch(`http://localhost:5000/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for cookies
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('Login response:', data);
      
      // Set token in localStorage
      localStorage.setItem('booklendiverse_token', data.token);
      console.log('Token stored:', data.token);
      
      // Store user data - ensure _id is available
      const userData = {
        ...data.user,
        _id: data.user._id || data.user.id // Ensure _id is available
      };
      
      setUser(userData);
      localStorage.setItem('booklendiverse_user', JSON.stringify(userData));
      
      // Initialize settings
      setSettings(mockSettings);
      
      // Reload user data to ensure we have complete information
      await loadUser();
      
      toast.success('Login successful');
      return { redirectTo: '/dashboard' };
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
      throw error;
    }
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    try {
      // Make real API call to the backend
      const response = await fetch(`http://localhost:5000/api/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include', // Important for cookies
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Set token in localStorage
      localStorage.setItem('booklendiverse_token', data.token);
      
      // Store user data - ensure _id is available
      const newUser = {
        ...data.user,
        _id: data.user._id || data.user.id // Ensure _id is available
      };
      
      setUser(newUser);
      localStorage.setItem('booklendiverse_user', JSON.stringify(newUser));
      
      // Initialize settings
      setSettings(mockSettings);
      
      toast.success('Registration successful');
      return newUser;
    } catch (error) {
      console.error('Error registering:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('booklendiverse_token');
      
      // Make API call to logout (invalidate token on server side)
      if (token) {
        try {
          await fetch('http://localhost:5000/api/users/logout', {
            method: 'POST',
            headers: {
              'x-auth-token': token,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
        } catch (error) {
          console.error('Error during logout API call:', error);
          // Continue with client-side logout even if API call fails
        }
      }
      
      // Clear local storage
      localStorage.removeItem('booklendiverse_token');
      localStorage.removeItem('booklendiverse_user');
      
      // Reset state
      setUser(null);
      setSettings(null);
      
      toast.success('Logged out successfully');
      
      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out. Please try again.');
      throw error;
    }
  };

  const updateProfile = async (data: Partial<IUser>) => {
    try {
      const token = localStorage.getItem('booklendiverse_token');
      if (!token) throw new Error('Not authenticated');
      if (!user) throw new Error('No user logged in');
      
      // Make sure we're sending the correct fields
      const updateData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        bio: data.bio,
        upiId: data.upiId,
      };
      
      console.log('Sending profile update data:', updateData);
      
      // Make API call to update profile
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      // Parse response as JSON
      const updatedUser = await response.json();
      console.log('Received updated user data:', updatedUser);
      
      // Update local user data
      setUser(prevUser => ({
        ...prevUser!,
        ...updatedUser,
      }));
      
      // Update localStorage
      localStorage.setItem('booklendiverse_user', JSON.stringify({
        ...user,
        ...updatedUser,
      }));
      
      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
      throw error;
    }
  };

  const updateSettings = async (data: Partial<UserSettings>) => {
    try {
      // In a real app, we'd send a request to the backend
      // For now, we'll just update the settings data
      const updatedSettings = { ...mockSettings, ...data };
      setSettings(updatedSettings);
      toast.success('Settings updated successfully');
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
      throw error;
    }
  };

  const addPaymentMethod = async (paymentMethod: PaymentMethodData) => {
    try {
      // In a real app, we'd send a request to the backend
      // For now, we'll just add the payment method to the user data
      if (!user) throw new Error('No user logged in');
      
      const updatedUser = {
        ...user,
        paymentMethods: [...(user.paymentMethods || []), paymentMethod],
      };
      
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('booklendiverse_user', JSON.stringify(updatedUser));
      
      toast.success('Payment method added successfully');
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add payment method');
      throw error;
    }
  };

  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      // In a real app, we'd send a request to the backend
      // For now, we'll just remove the payment method from the user data
      if (!user) throw new Error('No user logged in');
      
      const updatedUser = {
        ...user,
        paymentMethods: user.paymentMethods?.filter(pm => pm.id !== paymentMethodId) || [],
      };
      
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('booklendiverse_user', JSON.stringify(updatedUser));
      
      toast.success('Payment method removed successfully');
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast.error('Failed to remove payment method');
      throw error;
    }
  };

  const addBook = async (book: BookData) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const token = localStorage.getItem('booklendiverse_token');
      if (!token) throw new Error('Not authenticated');
      
      console.log('Using token:', token);
      console.log('Book data:', JSON.stringify(book));
      
      // Make API call to create the book
      const response = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(book),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error(errorData.message || 'Failed to create book');
      }
      
      // Get the created book from response with server-generated ID
      const newBook = await response.json();
      console.log('Book created successfully:', newBook);
      
      // Add the book to all books
      setAllBooks(prev => [...prev, newBook]);
      
      // Add the book to the user's books
      const updatedUser = {
        ...user,
        books: [...(user.books || []), newBook]
      };
      
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('booklendiverse_user', JSON.stringify(updatedUser));
      
      // Reload user data to ensure we have complete information
      await loadUser();
      
      return newBook;
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  };

  const getBooks = () => {
    return allBooks;
  };

  const getBookById = (id: string) => {
    return allBooks.find(book => book._id === id);
  };

  const deleteBook = async (id: string) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const token = localStorage.getItem('booklendiverse_token');
      if (!token) throw new Error('Not authenticated');
      
      // Make API call to delete the book
      const response = await fetch(`http://localhost:5000/api/books/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete book');
      }
      
      // Remove the book from all books
      setAllBooks(prev => prev.filter(book => book._id !== id));
      
      // Remove the book from the user's books
      const updatedUser = {
        ...user,
        books: user.books?.filter(book => book._id !== id) || []
      };
      
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('booklendiverse_user', JSON.stringify(updatedUser));
      
      // Reload user data to ensure we have complete information
      await loadUser();
      
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  };

  const updateBook = async (id: string, data: Partial<BookData>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      // Find the book
      const bookIndex = allBooks.findIndex(book => book._id === id);
      if (bookIndex === -1) throw new Error('Book not found');
      
      // Update the book in all books
      const updatedBook = { ...allBooks[bookIndex], ...data };
      const updatedAllBooks = [...allBooks];
      updatedAllBooks[bookIndex] = updatedBook;
      setAllBooks(updatedAllBooks);
      
      // Update the book in the user's books if it belongs to the user
      if (user.books) {
        const userBookIndex = user.books.findIndex(book => book._id === id);
        if (userBookIndex !== -1) {
          const updatedUserBooks = [...user.books];
          updatedUserBooks[userBookIndex] = updatedBook;
          
          const updatedUser = {
            ...user,
            books: updatedUserBooks
          };
          
          setUser(updatedUser);
          
          // Update localStorage
          localStorage.setItem('booklendiverse_user', JSON.stringify(updatedUser));
        }
      }
      
      return updatedBook;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };

  // Toggle a bookmark for a book
  const toggleBookmark = async (bookId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to bookmark books');
      return false;
    }

    try {
      const userBookmarks = user.bookmarks || [];
      const isCurrentlyBookmarked = userBookmarks.includes(bookId);
      
      let updatedBookmarks: string[];
      
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        updatedBookmarks = userBookmarks.filter(id => id !== bookId);
        toast.success('Book removed from bookmarks');
      } else {
        // Add bookmark
        updatedBookmarks = [...userBookmarks, bookId];
        toast.success('Book added to bookmarks');
      }
      
      const updatedUser = {
        ...user,
        bookmarks: updatedBookmarks
      };
      
      setUser(updatedUser);
      localStorage.setItem('booklendiverse_user', JSON.stringify(updatedUser));
      
      return !isCurrentlyBookmarked;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmarks');
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        settings,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updateSettings,
        addPaymentMethod,
        removePaymentMethod,
        addBook,
        getBooks,
        getBookById,
        deleteBook,
        updateBook,
        toggleBookmark
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 