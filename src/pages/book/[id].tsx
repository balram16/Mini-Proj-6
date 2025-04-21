'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, User, MapPin, Calendar, Clock, Shield, Truck } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';
import { toast } from 'react-hot-toast';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import 'ol/ol.css';
import PaymentModal from '@/components/PaymentModal';

export default function BookDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, getBooks, toggleBookmark } = useUser();
  const [book, setBook] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [modalTransactionType, setModalTransactionType] = useState<'rent' | 'buy'>('rent');
  
  useEffect(() => {
    if (!id) return;
    
    // Fetch book details from backend or context
    const fetchBookDetails = async () => {
      try {
        setIsLoading(true);
        
        // First try to get from context for immediate display
        const books = getBooks();
        const foundBook = books.find(b => b._id === id);
        
        if (foundBook) {
          setBook(foundBook);
        }
        
        // Then try to fetch from backend to get complete data with owner details
        try {
          const response = await fetch(`http://localhost:5000/api/books/${id}`);
          if (response.ok) {
            const bookData = await response.json();
            console.log("Backend book data:", bookData);
            // This should have the populated owner field with upiId
            setBook(bookData);
          }
        } catch (err) {
          console.error("Error fetching book from backend:", err);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching book details:", error);
        setIsLoading(false);
      }
    };
    
    fetchBookDetails();
  }, [id, getBooks]);

  // Initialize map when book data is loaded
  useEffect(() => {
    if (!book || !mapRef.current || map) return;
    
    // Check if the book has valid location coordinates
    if (!book.location?.coordinates?.lat || !book.location?.coordinates?.lng) return;
    
    // Create vector source for markers
    const vectorSource = new VectorSource();
    
    // Create vector layer for markers
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    
    // Create map instance
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        // Base map layer
        new TileLayer({
          source: new OSM(),
        }),
        // Markers layer
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([book.location.coordinates.lng, book.location.coordinates.lat]),
        zoom: 15,
      }),
    });
    
    setMap(initialMap);
    
    // Add book marker
    const bookFeature = new Feature({
      geometry: new Point(fromLonLat([book.location.coordinates.lng, book.location.coordinates.lat])),
    });
    
    bookFeature.setStyle(new Style({
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.7)',
        }),
        stroke: new Stroke({
          color: '#cc0000',
          width: 2,
        }),
      }),
    }));
    
    vectorSource.addFeature(bookFeature);
    
    // Cleanup
    return () => {
      if (initialMap) {
        initialMap.setTarget(undefined);
      }
    };
  }, [book, map]);

  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true);
  };

  // Get fallback image if the main image fails to load
  const getImageSrc = () => {
    if (imageError || !book.coverImage) {
      // Use a fallback image if the original fails
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&size=400&background=random`;
    }
    return book.coverImage;
  };

  const handleRentBook = () => {
    console.log("Rent button clicked!");
    if (!user) {
      toast.error('Please log in to rent books');
      router.push('/login');
      return;
    }

    if (!book) {
        toast.error("Book details not loaded yet.");
        return;
    }

    // Check if necessary data for RENT payment is available - removed wallet address check
    if (typeof book.rentPrice !== 'number') {
        toast.error("Rental price information is missing for this book.");
        console.error("Missing rentPrice for rent:", book);
        return;
    }

    // Set type and open the payment modal
    console.log("Opening payment modal for RENT");
    setModalTransactionType('rent');
    setIsPaymentModalOpen(true);
    console.log("isPaymentModalOpen set to:", true);
  };

  // --- New function for handling Buy --- 
  const handleBuyBook = () => {
    console.log("Buy button clicked!");
    if (!user) {
      toast.error('Please log in to buy books');
      router.push('/login');
      return;
    }

    if (!book) {
        toast.error("Book details not loaded yet.");
        return;
    }

    // Check if necessary data for BUY payment is available - removed wallet address check
    if (typeof book.price !== 'number') {
        toast.error("Price information is missing for this book.");
        console.error("Missing price for buy:", book);
        return;
    }

    // Set type and open the payment modal
    console.log("Opening payment modal for BUY");
    setModalTransactionType('buy');
    setIsPaymentModalOpen(true);
    console.log("isPaymentModalOpen set to:", true);
  };
  // --- End new function --- 

  const handleBookmark = async () => {
    try {
      if (!user) {
        toast.error('Please log in to bookmark books');
        return;
      }

      if (!book) return;

      const isBookmarked = await toggleBookmark(book._id);
      if (isBookmarked) {
        toast.success('Book added to your bookmarks');
      } else {
        toast.success('Book removed from your bookmarks');
      }
    } catch (error) {
      toast.error('Failed to bookmark book');
    }
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

  if (!book) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="py-20 max-w-7xl mx-auto px-6 md:px-10 text-center">
          <h2 className="text-2xl font-serif mb-4">Book not found</h2>
          <p className="text-muted-foreground mb-6">The book you're looking for could not be found.</p>
          <Link href="/browse">
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

  // Calculate prices and fees
  const rentPrice = book.rentPrice || 0;
  const buyPrice = book.price || 0;
  // Convert prices to INR - Use direct values instead of conversion if already in INR
  const rentPriceINR = rentPrice; // No conversion - assume already in INR
  const buyPriceINR = buyPrice; // No conversion - assume already in INR
  // Calculate deposit fee as 10x the daily rent
  const depositFee = rentPriceINR * 10;
  
  // Use a hardcoded wallet address for testing if sellerWalletAddress is missing
  const sellerWalletAddress = book.sellerWalletAddress || book.ownerWalletAddress || "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
  
  // Extract UPI ID from book owner - handle all possible data formats
  let sellerUpiId = "demouser123@ybl"; // Default fallback
  
  // Debug all possible paths to the UPI ID
  console.log("Owner data type:", typeof book.owner);
  
  if (book.owner) {
    if (typeof book.owner === 'object') {
      // Backend API would return a populated owner object
      if (book.owner.upiId) {
        sellerUpiId = book.owner.upiId;
        console.log("Found UPI ID in owner object:", sellerUpiId);
      }
    } else if (typeof book.owner === 'string') {
      // This could be just the owner ID, not populated
      console.log("Owner is just an ID, not populated");
    }
  }

  // --- Add Logs for Debugging ---
  console.log("--- Book Data Debug ---");
  console.log("User logged in:", !!user);
  console.log("Book Data:", book); // Log the whole book object
  console.log("Book Owner Data:", book.owner); // Log the owner data specifically
  console.log("Final Seller UPI ID to be used:", sellerUpiId); // Log the final UPI ID
  console.log("Seller Wallet Address found:", sellerWalletAddress);
  console.log("Rent Price:", rentPrice, "INR:", rentPriceINR);
  console.log("Buy Price:", buyPrice, "INR:", buyPriceINR);
  console.log("---------------------------");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-10 max-w-7xl mx-auto px-6 md:px-10">
        <Link href="/browse" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all books
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Book Cover */}
          <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
            <img 
              src={getImageSrc()} 
              alt={`${book.title} by ${book.author}`} 
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
          
          {/* Book Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{book.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">{book.author}</p>
            
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-medium">{book.rating || 'N/A'}</span>
              </div>
              <div className="w-1 h-1 bg-muted rounded-full mx-3"></div>
              <div className="flex items-center text-muted-foreground">
                <User className="w-4 h-4 mr-1" />
                <span>{typeof book.owner === 'object' ? book.owner.name || 'Unknown Seller' : typeof book.owner === 'string' ? book.owner : 'Unknown Seller'}</span>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground">
                {book.description || "No description available for this book."}
              </p>
            </div>
            
            {/* Book Details */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-foreground mb-4">Book Details</h3>
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Condition</span>
                  <p className="font-medium">{book.condition || "Good"}</p>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">
                    {book.transactionType === 'rent' ? 'Rent Price' : 'Price'}
                  </span>
                  <p className="font-medium">
                    {book.transactionType === 'rent' 
                      ? `₹${rentPriceINR.toFixed(2)} / day` 
                      : `₹${buyPriceINR.toFixed(2)}`}
                  </p>
                </div>
                
                {book.transactionType === 'rent' && (
                  <div>
                    <span className="text-sm text-muted-foreground">Deposit Required</span>
                    <p className="font-medium">₹{depositFee.toFixed(2)}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm text-muted-foreground">Added on</span>
                  <p className="font-medium">{new Date(book.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {/* Location Section with Map */}
            {book.location && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-1" /> 
                  Book Location
                </h3>
                <div className="space-y-4">
                  <div className="bg-muted/20 p-4 rounded-lg">
                    {book.location.address && (
                      <div className="mb-2">
                        <span className="text-sm text-muted-foreground">Address:</span>
                        <p className="font-medium">{book.location.address}</p>
                      </div>
                    )}
                    {(book.location.city || book.location.state) && (
                      <div>
                        <span className="text-sm text-muted-foreground">City/State:</span>
                        <p className="font-medium">
                          {[book.location.city, book.location.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                    {(!book.location.address && !book.location.city && !book.location.state) && (
                      <p className="text-muted-foreground italic">No specific location provided</p>
                    )}
                  </div>
                  
                  {/* Map Container */}
                  {book.location.coordinates?.lat && book.location.coordinates?.lng && (
                    <div 
                      ref={mapRef} 
                      className="w-full h-[200px] rounded-lg shadow-md"
                    />
                  )}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mb-8">
              {book.genre.map((genre, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
            
            {/* Rental/Purchase Action Section */}
            <div className="border-t pt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="block text-sm text-muted-foreground mb-1">
                    {book.transactionType === 'rent' ? 'Rental price' : 'Purchase price'}
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {book.transactionType === 'rent' ? `₹${rentPriceINR.toFixed(2)}` : `₹${buyPriceINR.toFixed(2)}`}
                  </span>
                  {book.transactionType === 'rent' && (
                    <span className="text-muted-foreground ml-1">/ day</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="block text-sm text-muted-foreground mb-1">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    book.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {book.available ? 'Available' : 'Currently Unavailable'}
                  </span>
                </div>
              </div>
              
              {/* Show the owner's UPI ID if available */}
              {book.owner?.upiId && (
                <div className="mb-4 p-3 bg-muted/20 rounded-md">
                  <p className="text-sm text-muted-foreground">Payment Information</p>
                  <div className="flex items-center mt-1">
                    <span className="font-medium">UPI ID:</span>
                    <code className="ml-2 bg-muted px-2 py-1 rounded text-sm">
                      {typeof book.owner === 'object' && book.owner?.upiId ? book.owner.upiId : sellerUpiId}
                    </code>
                  </div>
                </div>
              )}
              
              <div className="mt-10 flex items-center gap-4">
                {book.transactionType === 'rent' && (
                  <Button
                    size="lg"
                    onClick={(e) => {
                      // Prevent default to be sure
                      e.preventDefault();
                      // Use explicit function logic here
                      console.log("Direct RENT button handler called");
                      if (!user) {
                        toast.error('Please log in to rent books');
                        router.push('/login');
                        return;
                      }
                      
                      // Display toast message to confirm this handler is called
                      toast.success('Opening payment modal for renting');
                      
                      setModalTransactionType('rent');
                      setIsPaymentModalOpen(true);
                    }}
                    disabled={!user || typeof book.rentPrice !== 'number'}
                  >
                    Rent Book - ₹{rentPriceINR.toFixed(2)}/day
                  </Button>
                )}
                {book.transactionType === 'buy' && (
                  <Button
                    size="lg"
                    onClick={(e) => {
                      // Prevent default to be sure
                      e.preventDefault();
                      // Use explicit function logic here
                      console.log("Direct BUY button handler called");
                      if (!user) {
                        toast.error('Please log in to buy books');
                        router.push('/login');
                        return;
                      }
                      
                      // Display toast message to confirm this handler is called
                      toast.success('Opening payment modal for buying');
                      
                      setModalTransactionType('buy');
                      setIsPaymentModalOpen(true);
                    }}
                    disabled={!user || typeof book.price !== 'number'}
                  >
                    Buy Book - ₹{buyPriceINR.toFixed(2)}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleBookmark}
                  disabled={!user}
                >
                  {user?.bookmarks?.includes(book._id) ? 'Remove Bookmark' : 'Add Bookmark'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Render Payment Modal Conditionally - Now handles both types */}
      {book && isPaymentModalOpen ? (
        <>
          {console.log("PAYMENT MODAL DEBUG:", { 
            isModalOpen: isPaymentModalOpen, 
            transactionType: modalTransactionType, 
            bookAvailable: !!book 
          })}
          {toast.success("Opening payment modal - if you see this but no modal appears, there's a rendering issue")}
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              console.log("Closing payment modal");
              setIsPaymentModalOpen(false);
            }}
            bookId={book._id}
            bookTitle={book.title}
            transactionType={modalTransactionType}
            price={modalTransactionType === 'rent' ? rentPriceINR : buyPriceINR}
            sellerName={book.owner?.name || 'Unknown Seller'}
            sellerWalletAddress={sellerWalletAddress}
            sellerUpiId={sellerUpiId}
            depositFee={depositFee}
          />
        </>
      ) : (
        console.log("PaymentModal not rendered, conditions:", { 
          bookExists: !!book, 
          isModalOpen: isPaymentModalOpen 
        })
      )}
    </div>
  );
} 