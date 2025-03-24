'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookType } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookMap from '@/components/BookMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { MapPin, BookOpen, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function NearbyPage() {
  const [radius, setRadius] = useState(5); // miles
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch nearby books
  const { data: books = [], isLoading } = useQuery<(BookType & { title: string; id: string })[]>({
    queryKey: ['nearbyBooks', radius],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/books/nearby?radius=${radius}`);
        if (!response.ok) {
          throw new Error('Failed to fetch nearby books');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching books:', error);
        return [];
      }
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold mb-2">Find Books Nearby</h1>
            <p className="text-gray-600">
              Discover books available for borrowing in your area
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Within</span>
                <select
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  <option value={1}>1 mile</option>
                  <option value={5}>5 miles</option>
                  <option value={10}>10 miles</option>
                  <option value={25}>25 miles</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            {/* Map Section */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Search Radius: {radius} miles</CardTitle>
                    <div className="w-[200px]">
                      <Slider
                        value={[radius]}
                        onValueChange={([value]) => setRadius(value)}
                        min={1}
                        max={25}
                        step={1}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <BookMap
                    books={books}
                    onBookSelect={setSelectedBookId}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Book List Section */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search nearby books..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : books.length === 0 ? (
                    <p className="text-gray-500">No books found in this area</p>
                  ) : (
                    <div className="space-y-4">
                      {books.map((book) => (
                        <div
                          key={book.id}
                          className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                            selectedBookId === book.id
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedBookId(book.id)}
                        >
                          <h3 className="font-medium mb-1">{book.title}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{book.location.address}</span>
                          </div>
                          {book.distance && (
                            <p className="text-sm text-gray-500 mt-1">
                              {book.distance.toFixed(1)} miles away
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 