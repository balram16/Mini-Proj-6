import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBooks } from '@/api/books';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookCard from '@/components/BookCard';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';

import {upiId
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Books = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [availability, setAvailability] = useState('all');
  const [filteredBooks, setFilteredBooks] = useState([]);
  
  const { data: books, isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks
  });

  const genres = books ? [...new Set(books.flatMap(book => book.genre))] : [];
  
  useEffect(() => {
    if (books) {
      setFilteredBooks(
        books.filter(book => {
          const matchesSearch = 
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.genre.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()));
          
          const matchesGenre = selectedGenre === 'all' || book.genre.includes(selectedGenre);
          
          const matchesPrice = book.rentPrice >= priceRange[0] && book.rentPrice <= priceRange[1];
          
          const matchesAvailability = availability === 'all' || 
            (availability === 'available' && book.available) ||
            (availability === 'rented' && !book.available);
          
          return matchesSearch && matchesGenre && matchesPrice && matchesAvailability;
        })
      );
    }
  }, [searchTerm, books, selectedGenre, priceRange, availability]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-book-accent bg-opacity-10">
          <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-book-primary mb-4">
                Explore Available Books
              </h1>
              <p className="text-book-secondary text-lg mb-10 max-w-2xl mx-auto">
                Browse through our collection of books available for rent from readers in your community.
              </p>
              
              <div className="flex gap-4 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search by title, author or genre..."
                    className="pl-10 h-12"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-12">
                      <Filter className="h-5 w-5 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filter Books</SheetTitle>
                      <SheetDescription>
                        Refine your search with these filters
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="mt-6 space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Genre</label>
                        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select genre" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Genres</SelectItem>
                            {genres.map(genre => (
                              <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Price Range ($/week): {priceRange[0]} - {priceRange[1]}
                        </label>
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          min={0}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Availability</label>
                        <Select value={availability} onValueChange={setAvailability}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="available">Available Now</SelectItem>
                            <SelectItem value="rented">Currently Rented</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </section>
        
        {/* Active Filters */}
        <section className="py-6 border-b">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="flex flex-wrap gap-2">
              {selectedGenre !== 'all' && (
                <Badge variant="secondary" className="px-3 py-1">
                  Genre: {selectedGenre}
                  <button
                    className="ml-2"
                    onClick={() => setSelectedGenre('all')}
                  >
                    ×
                  </button>
                </Badge>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 100) && (
                <Badge variant="secondary" className="px-3 py-1">
                  Price: ${priceRange[0]} - ${priceRange[1]}/week
                  <button
                    className="ml-2"
                    onClick={() => setPriceRange([0, 100])}
                  >
                    ×
                  </button>
                </Badge>
              )}
              {availability !== 'all' && (
                <Badge variant="secondary" className="px-3 py-1">
                  {availability === 'available' ? 'Available Now' : 'Currently Rented'}
                  <button
                    className="ml-2"
                    onClick={() => setAvailability('all')}
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </div>
        </section>
        
        {/* Books Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="h-[400px] bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500">Error loading books. Please try again later.</p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-book-secondary">No books found matching your search criteria.</p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-book-secondary">
                  Showing {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {filteredBooks.map(book => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Books;
