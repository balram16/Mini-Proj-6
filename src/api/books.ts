
import { BookType } from "@/lib/bookData";

// Get all books
export const fetchBooks = async (): Promise<BookType[]> => {
  const response = await fetch('/api/books');
  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }
  return response.json();
};

// Get a single book by id
export const fetchBookById = async (id: string): Promise<BookType> => {
  const response = await fetch(`/api/books/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch book');
  }
  return response.json();
};

// Create a new book
export const createBook = async (bookData: Omit<BookType, 'id'>): Promise<BookType> => {
  const response = await fetch('/api/books', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create book');
  }
  
  return response.json();
};

// Update a book
export const updateBook = async (id: string, bookData: Partial<BookType>): Promise<BookType> => {
  const response = await fetch(`/api/books/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update book');
  }
  
  return response.json();
};

// Delete a book
export const deleteBook = async (id: string): Promise<void> => {
  const response = await fetch(`/api/books/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete book');
  }
};
