import { useState } from 'react';
import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';
import { BookType } from '@/lib/bookData';
import { cn } from '@/lib/utils';

// Temporary mock data until we integrate with the API
const mockBooks: BookType[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverImage: '/images/books/gatsby.jpg',
    description: 'A story of decadence and excess, Gatsby explores the darker aspects of the Jazz Age.',
    genre: ['Classic', 'Literary Fiction'],
    rating: 4.5,
    rentPrice: 3.99,
    rentPeriod: '2 weeks',
    owner: {
      id: '101',
      name: 'John Smith',
      rating: 4.8,
      location: 'New York, NY'
    },
    available: true
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    coverImage: '/images/books/1984.jpg',
    description: 'A dystopian social science fiction novel that examines the consequences of totalitarianism.',
    genre: ['Science Fiction', 'Dystopian'],
    rating: 4.8,
    rentPrice: 4.50,
    rentPeriod: '3 weeks',
    owner: {
      id: '102',
      name: 'Jane Doe',
      rating: 4.9,
      location: 'San Francisco, CA'
    },
    available: true
  },
  {
    id: '3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    coverImage: '/images/books/mockingbird.jpg',
    description: 'A powerful story of racial injustice and the loss of innocence in the American South.',
    genre: ['Classic', 'Historical Fiction'],
    rating: 4.7,
    rentPrice: 3.75,
    rentPeriod: '2 weeks',
    owner: {
      id: '103',
      name: 'Mike Johnson',
      rating: 4.7,
      location: 'Chicago, IL'
    },
    available: true
  }
];

const FeaturedBooks = () => {
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <span className="text-book-accent font-semibold text-sm tracking-wider">FEATURED BOOKS</span>
          <h2 className="text-3xl font-serif font-bold text-book-primary mt-1">Popular Books Near You</h2>
          <p className="text-book-secondary max-w-2xl mx-auto mt-2">
            Discover the most sought-after books in your area. From bestsellers to hidden gems, find your next great read.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockBooks.map((book: BookType) => (
            <div
              key={book.id}
              className="group bg-white rounded-lg shadow-elegant overflow-hidden hover:shadow-xl transition-shadow duration-300"
              onMouseEnter={() => setHoveredBook(book.id)}
              onMouseLeave={() => setHoveredBook(null)}
            >
              <Link href={`/books/${book.id}`} className="block h-full w-full relative overflow-hidden">
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Book Image */}
                <div className="aspect-[3/4] relative">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Book Info */}
                <div className="p-6">
                  <h3 className="text-xl font-serif font-semibold text-book-primary mb-2">{book.title}</h3>
                  <p className="text-book-secondary text-sm mb-4">{book.author}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-book-secondary">{book.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-book-secondary">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{book.owner.location}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/books" className="elegant-button">
            View All Books
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;
