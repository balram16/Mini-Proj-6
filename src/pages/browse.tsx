'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Heart, MapPin, Grid, Map as MapIcon } from 'lucide-react';
import { BookCard } from '@/components/BookCard';
import { toast } from 'react-hot-toast';
import { useUser } from '@/lib/contexts/UserContext';
import Link from 'next/link';
import BookLocationMap from '@/components/BookLocationMap';

interface BookData {
  _id: string;
  title: string;
  author: string;
  description: string;
  price?: number;
  rentPrice?: number;
  condition: string;
  genre: string[];
  coverImage: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    coordinates?: {
      lat: number;
      lng: number;
    }
  };
  owner: string;
  available: boolean;
  createdAt: string;
  likes: string[];
  comments: any[];
  rating?: number;
}

const genres = [
  'All',
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Science Fiction',
  'Fantasy',
  'Romance',
  'Thriller',
  'Horror',
  'Biography',
  'History',
  'Children',
  'Young Adult',
  'Educational',
  'Textbook',
  'Self-Help',
  'Poetry',
  'Other'
];

export default function BrowsePage() {
  const { getBooks, user, toggleBookmark } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [filteredBooks, setFilteredBooks] = useState<BookData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  useEffect(() => {
    // Get all books from UserContext
    const allBooks = getBooks();
    setIsLoading(false);

    // Filter books based on search query and genre
    let filtered = [...allBooks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query)
      );
    }

    // Apply genre filter
    if (selectedGenre !== 'All') {
      filtered = filtered.filter(book => 
        book.genre.some(g => g.toLowerCase() === selectedGenre.toLowerCase())
      );
    }

    setFilteredBooks(filtered);
  }, [getBooks, searchQuery, selectedGenre]);

  const handleBookmark = async (bookId: string) => {
    try {
      if (!user) {
        toast.error('Please log in to bookmark books');
        return;
      }

      const isBookmarked = await toggleBookmark(bookId);
      if (isBookmarked) {
        toast.success('Book added to your bookmarks');
      } else {
        toast.success('Book removed from your bookmarks');
      }
    } catch (error) {
      toast.error('Failed to bookmark book');
    }
  };

  // Handle when a book is selected from the map
  const handleBookSelect = (bookId: string) => {
    setSelectedBookId(bookId);
    // Scroll to the book in the list if we're in grid view
    if (viewMode === 'grid') {
      const bookElement = document.getElementById(`book-${bookId}`);
      if (bookElement) {
        bookElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Process books to ensure they have proper location data structure
  const processedBooks = filteredBooks.map(book => {
    // Make sure the book has a location object with coordinates
    if (!book.location) {
      return {
        ...book,
        location: {
          address: '',
          city: '',
          state: '',
          coordinates: {
            lat: 0,
            lng: 0
          }
        }
      };
    }
    
    // If the book has location but no coordinates, add dummy coordinates
    if (!book.location.coordinates) {
      return {
        ...book,
        location: {
          ...book.location,
          coordinates: {
            lat: 0,
            lng: 0
          }
        }
      };
    }
    
    return book;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {/* View Toggle Buttons */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                className="rounded-none border-0"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                className="rounded-none border-0"
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="h-4 w-4 mr-1" />
                Map
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Genre Filter Pills */}
        <div className="flex gap-2 mt-6 pb-4 overflow-x-auto">
          {genres.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGenre(genre)}
              className="rounded-full"
            >
              {genre}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading books...</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <div 
                      key={book._id} 
                      id={`book-${book._id}`}
                      className={selectedBookId === book._id ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}
                    >
                      <BookCard 
                        book={book} 
                        onBookmark={() => handleBookmark(book._id)} 
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No books found matching your criteria.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full mt-8">
                <BookLocationMap 
                  books={processedBooks}
                  onBookSelect={handleBookSelect}
                  className="h-[600px]"
                />
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
} 