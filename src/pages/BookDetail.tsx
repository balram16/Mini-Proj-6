import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchBookById } from '@/api/books';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, User, MapPin, Calendar, Clock, Shield, Truck } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';
import RentBookModal from '@/components/RentBookModal';
import { useToast } from '@/components/ui/use-toast';

const BookDetail = () => {
  const { id } = useParams();
  const { user } = useUser();
  const { toast } = useToast();
  const [showRentModal, setShowRentModal] = useState(false);
  const navigate = useNavigate();
  
  const { data: book, isLoading, error } = useQuery({
    queryKey: ['book', id],
    queryFn: () => fetchBookById(id as string),
    enabled: !!id
  });
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRentSuccess = () => {
    toast({
      title: 'Book Rented Successfully',
      description: 'You will receive an email with further instructions.',
      variant: 'default',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="py-10 max-w-7xl mx-auto px-6 md:px-10">
          <div className="animate-pulse">
            <div className="h-8 w-40 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="h-[500px] bg-gray-200 rounded"></div>
              <div>
                <div className="h-10 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 w-1/2 bg-gray-200 rounded mb-6"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-6"></div>
                <div className="h-10 w-1/3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="py-20 max-w-7xl mx-auto px-6 md:px-10 text-center">
          <h2 className="text-2xl font-serif mb-4">Book not found</h2>
          <p className="text-book-secondary mb-6">The book you're looking for could not be loaded.</p>
          <Link to="/books">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Books
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-10 max-w-7xl mx-auto px-6 md:px-10">
        <Link to="/books" className="inline-flex items-center text-book-secondary hover:text-book-primary mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all books
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Book Cover */}
          <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={book.coverImage} 
              alt={`${book.title} by ${book.author}`} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Book Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-book-primary mb-2">{book.title}</h1>
            <p className="text-xl text-book-secondary mb-4">{book.author}</p>
            
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-medium">{book.rating}</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full mx-3"></div>
              <div className="flex items-center text-book-secondary">
                <User className="w-4 h-4 mr-1" />
                <span>{book.owner.name}</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full mx-3"></div>
              <div className="flex items-center text-book-secondary">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{book.owner.location}</span>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium text-book-primary mb-2">Description</h3>
              <p className="text-book-secondary">
                {book.description || "No description available for this book."}
              </p>
            </div>
            
            {/* Rental Terms Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-book-primary mb-4">Rental Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-book-secondary mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">Available from</span>
                  </div>
                  <p className="font-medium">
                    {book.availableFrom || "Immediately"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-book-secondary mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">Minimum rental</span>
                  </div>
                  <p className="font-medium">{book.minRentalDuration || book.rentPeriod}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-book-secondary mb-1">
                    <Shield className="w-4 h-4 mr-2" />
                    <span className="text-sm">Security deposit</span>
                  </div>
                  <p className="font-medium">${book.securityDeposit || "50"}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-book-secondary mb-1">
                    <Truck className="w-4 h-4 mr-2" />
                    <span className="text-sm">Pickup/Return</span>
                  </div>
                  <p className="font-medium">{book.pickupMethod || "In person"}</p>
                </div>
              </div>
            </div>

            {/* Additional Book Details */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-book-primary mb-4">Book Details</h3>
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <span className="text-sm text-book-secondary">Condition</span>
                  <p className="font-medium">{book.condition || "Good"}</p>
                </div>
                <div>
                  <span className="text-sm text-book-secondary">Language</span>
                  <p className="font-medium">{book.language || "English"}</p>
                </div>
                <div>
                  <span className="text-sm text-book-secondary">ISBN</span>
                  <p className="font-medium">{book.isbn || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-book-secondary">Publisher</span>
                  <p className="font-medium">{book.publisher || "N/A"}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {book.genre.map((genre, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-book-accent/10 text-book-accent rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
            
            {/* Rental Action Section */}
            <div className="border-t pt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="block text-sm text-book-secondary mb-1">Rental price</span>
                  <span className="text-2xl font-bold text-book-primary">${book.rentPrice}</span>
                  <span className="text-book-secondary ml-1">/ week</span>
                </div>
                <div className="text-right">
                  <span className="block text-sm text-book-secondary mb-1">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    book.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {book.available ? 'Available' : 'Currently Rented'}
                  </span>
                </div>
              </div>
              
              {user ? (
                <Button
                  size="lg"
                  className="w-full"
                  disabled={!book.available}
                  onClick={() => setShowRentModal(true)}
                >
                  {book.available ? 'Rent Now' : 'Currently Unavailable'}
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/auth')}
                >
                  Sign in to Rent
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Rent Book Modal */}
      {user && (
        <RentBookModal
          book={book}
          isOpen={showRentModal}
          onClose={() => setShowRentModal(false)}
          onSuccess={handleRentSuccess}
        />
      )}
    </div>
  );
};

export default BookDetail;
