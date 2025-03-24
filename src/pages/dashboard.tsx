'use client';

import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/router';
import { User, Book, Settings, LogOut, CreditCard, Bell, Globe, DollarSign, BookOpen, BookHeart, ClipboardList, Plus, Loader2, MapPin, Map } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';
import { useQuery } from '@tanstack/react-query';
import { getBookById } from '@/lib/bookData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookCard } from '@/components/BookCard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { OpenLayersLoader } from '@/components/OpenLayersLoader';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BadgesDisplay from '@/components/BadgesDisplay';
import TransactionHistory from '@/components/TransactionHistory';

const DashboardPage = () => {
  const router = useRouter();
  const { user, settings, updateProfile, updateSettings, addPaymentMethod, removePaymentMethod, logout, addBook, deleteBook, getBooks, toggleBookmark } = useUser();
  const { tab } = router.query;
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    rentPrice: '',
    transactionType: 'rent',
    condition: 'Good',
    genre: 'Fiction',
    language: 'English',
    location: {
      address: '',
      city: '',
      state: '',
      coordinates: {
        lat: 0,
        lng: 0
      }
    }
  });
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    upiId: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isListingBook, setIsListingBook] = useState(false);
  const [isListingLoading, setIsListingLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [listedBooks, setListedBooks] = useState<any[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [bookmarkedBooks, setBookmarkedBooks] = useState<any[]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const mapPreviewRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [olLoaded, setOlLoaded] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  // Define tabs 
  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'listing', label: 'My Books', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'bookmarks', label: 'Bookmarks', icon: <BookHeart className="h-4 w-4" /> },
    { id: 'rental-history', label: 'Rental History', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (user) {
      // Parse location data properly
      let locationValue = '';
      if (typeof user.location === 'string') {
        locationValue = user.location;
      } else if (typeof user.location === 'object' && user.location) {
        // If location is an object with address, use that
        locationValue = user.location.address || '';
      }

      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: locationValue,
        bio: user.bio || '',
        upiId: user.upiId || ''
      });
    }
    
    // Check if there's a tab parameter in the URL
    const { tab } = router.query;
    if (tab && typeof tab === 'string') {
      setActiveTab(tab);
    }
  }, [user, router.query]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      console.log('Current user:', user);
      console.log('Attempting to update profile with data:', profileData);
      
      if (!user?._id) {
        throw new Error('User not logged in');
      }

      const updateData = {
        ...profileData,
        _id: user._id
      };

      const updatedUser = await updateProfile(updateData);
      console.log('Profile update response:', updatedUser);
      
      if (updatedUser) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile - no response from server');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch borrowed books
  const borrowedBooksQuery = useQuery({
    queryKey: ['borrowedBooks', user?.borrowedBooks],
    queryFn: () => Promise.all((user?.borrowedBooks || []).map(id => getBookById(id))),
    enabled: !!user?.borrowedBooks?.length,
  });

  // Fetch user's books
  useEffect(() => {
    const fetchUserBooks = async () => {
      if (user && user._id) {
        setIsLoadingBooks(true);
        try {
          const token = localStorage.getItem('booklendiverse_token');
          if (!token) {
            setIsLoadingBooks(false);
            return;
          }
          
          // Fetch user's books from API
          const response = await fetch(`http://localhost:5000/api/books/user/${user._id}`, {
            headers: {
              'x-auth-token': token,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch user books');
          }
          
          const booksData = await response.json();
          setListedBooks(booksData);
        } catch (error) {
          console.error('Error fetching user books:', error);
          toast.error('Failed to load your books');
          // Fallback to books from user context if API fails
          if (user.books) {
            setListedBooks(user.books);
          }
        } finally {
          setIsLoadingBooks(false);
        }
      }
    };
    
    fetchUserBooks();
  }, [user]);

  const handleSettingsUpdate = async (key: keyof typeof settings, value: any) => {
    if (settings) {
      await updateSettings({ [key]: value });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // In a real application, we would upload the file to a server
      // For demonstration purposes, we'll use a reliable image placeholder service
      
      // Get file size in MB
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        throw new Error('File size exceeds 5MB limit');
      }
      
      // Generate a random book cover using a reliable service
      // Use the file name as part of the seed for some consistency
      const seed = encodeURIComponent(file.name.split('.')[0]);
      
      // Try to use multiple possible image services for resilience
      const imageServices = [
        `https://picsum.photos/seed/${seed}/400/600`, // Lorem Picsum
        `https://source.unsplash.com/400x600/?book,${seed}`, // Unsplash
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.title)}&size=400&background=random`, // UI Avatars
        `https://avatars.dicebear.com/api/initials/${encodeURIComponent(formData.title)}.svg?size=400` // DiceBear
      ];
      
      // Use the first image service
      const mockImageUrl = imageServices[0];
      
      setImageUrl(mockImageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    }
  };

  const handleListBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsListingLoading(true);

    try {
      // Check if user is logged in
      if (!user?._id) {
        throw new Error('User not logged in');
      }

      // Check if all required fields are filled
      if (!formData.title || !formData.author || !formData.description || !formData.price) {
        throw new Error('Please fill in all required fields');
      }

      // For demonstration purposes, we'll use a placeholder image if none was uploaded
      const coverImage = imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(formData.title)}`;

      // If user location is available, use it as default for book location
      const bookLocation = {
        ...formData.location,
        // Use user's location data if the book location is not specified
        address: formData.location.address || user.location || '',
        city: formData.location.city || '',
        state: formData.location.state || '',
      };

      // Create new book object with all required backend fields
      const newBook = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        // Set price or rentPrice based on transaction type
        price: formData.transactionType === 'buy' ? parseFloat(formData.price) : 0,
        rentPrice: formData.transactionType === 'rent' ? parseFloat(formData.price) : 0,
        depositAmount: formData.transactionType === 'rent' ? parseFloat(formData.price) * 2 : 0, // Sample deposit amount
        coverImage: coverImage,
        condition: formData.condition,
        genre: [formData.genre],
        language: formData.language,
        location: bookLocation,
        available: true,
        transactionType: formData.transactionType,
        publishedYear: new Date().getFullYear() // Default to current year
      };

      // Add book using UserContext (which now calls the backend API)
      await addBook(newBook);
      
      toast.success('Book listed successfully!');
      
      // Reset form
      setFormData({
        title: '',
        author: '',
        description: '',
        price: '',
        rentPrice: '',
        transactionType: 'rent',
        condition: 'Good',
        genre: 'Fiction',
        language: 'English',
        location: {
          address: '',
          city: '',
          state: '',
          coordinates: {
            lat: 0,
            lng: 0
          }
        }
      });
      setImageUrl('');
      setIsListingBook(false);
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to list book');
    } finally {
      setIsListingLoading(false);
    }
  };

  const handleRemoveBook = async (bookId: string) => {
    try {
      await deleteBook(bookId);
      toast.success('Book removed successfully!');
      
      // Refresh the book list after deletion
      setListedBooks(prev => prev.filter(book => book._id !== bookId));
    } catch (error) {
      console.error('Error removing book:', error);
      toast.error('Failed to remove book');
    }
  };

  // Fetch bookmarked books
  useEffect(() => {
    if (user && user.bookmarks?.length) {
      setIsLoadingBookmarks(true);
      const books = getBooks();
      const bookmarks = books.filter(book => user.bookmarks?.includes(book._id));
      setBookmarkedBooks(bookmarks);
      setIsLoadingBookmarks(false);
    }
  }, [user, getBooks]);

  // Add a function to initialize and update the map when coordinates change
  useEffect(() => {
    if (!formData.location.coordinates.lat || !formData.location.coordinates.lng || 
        formData.location.coordinates.lat === 0 || formData.location.coordinates.lng === 0 ||
        !mapPreviewRef.current || !olLoaded) return;
    
    // Clean up previous map instance
    if (mapInstance) {
      mapInstance.setTarget(undefined);
    }
    
    // Create a new map instance
    try {
      const { Map, View } = window.ol;
      const { Tile: TileLayer, Vector: VectorLayer } = window.ol.layer;
      const { OSM, Vector: VectorSource } = window.ol.source;
      const { fromLonLat } = window.ol.proj;
      const { Point } = window.ol.geom;
      const { Feature } = window.ol;
      const { Style, Circle, Fill, Stroke } = window.ol.style;
      
      // Create the map
      const newMap = new Map({
        target: mapPreviewRef.current,
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          center: fromLonLat([formData.location.coordinates.lng, formData.location.coordinates.lat]),
          zoom: 15
        })
      });
      
      // Add a marker for the book location
      const markerSource = new VectorSource();
      const markerLayer = new VectorLayer({
        source: markerSource
      });
      
      const markerFeature = new Feature({
        geometry: new Point(fromLonLat([formData.location.coordinates.lng, formData.location.coordinates.lat]))
      });
      
      markerFeature.setStyle(new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({
            color: 'rgba(255, 0, 0, 0.7)'
          }),
          stroke: new Stroke({
            color: '#cc0000',
            width: 2
          })
        })
      }));
      
      markerSource.addFeature(markerFeature);
      newMap.addLayer(markerLayer);
      
      setMapInstance(newMap);
      
      // Return cleanup function
      return () => {
        if (newMap) {
          newMap.setTarget(undefined);
        }
      };
    } catch (error) {
      console.error('Error creating map preview:', error);
    }
  }, [formData.location.coordinates.lat, formData.location.coordinates.lng, olLoaded]);

  const searchLocation = async () => {
    if (!locationSearch.trim()) {
      toast.error('Please enter a location to search');
      return;
    }
    
    try {
      toast.loading('Searching for location...');
      
      // Use Nominatim to search for the location
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}`
      );
      
      const data = await response.json();
      toast.dismiss();
      
      if (data && data.length > 0) {
        const result = data[0];
        const { lat, lon, display_name } = result;
        
        // Parse the display name to get address components
        const addressParts = display_name.split(', ');
        
        // Extract address components - this is a simple approach and might need refinement
        const address = addressParts[0] || '';
        const city = addressParts[1] || addressParts[2] || '';
        const state = addressParts[addressParts.length - 2] || '';
        
        // Update the form data with the found location
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            address,
            city,
            state,
            coordinates: {
              lat: parseFloat(lat),
              lng: parseFloat(lon)
            }
          }
        });
        
        toast.success('Location found!');
      } else {
        toast.error('Location not found. Please try a different search term.');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error searching for location:', error);
      toast.error('Failed to search for location');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-7xl py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Hello, {user?.name || 'User'}</h1>
          <p className="text-muted-foreground">Manage your books, transactions, and account settings</p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="profile" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your personal information and profile settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="profile-form" onSubmit={handleSaveChanges} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email (cannot be changed)</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          disabled={true}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={profileData.location}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="upiId">UPI ID for Payments</Label>
                        <Input
                          id="upiId"
                          name="upiId"
                          value={profileData.upiId}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                          placeholder="username@bankname"
                        />
                        {isEditing && (
                          <p className="text-xs text-muted-foreground mt-1">
                            This will be used to receive payments when your books are rented or sold
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileInputChange}
                        disabled={!isEditing}
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4">
                    {isEditing ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setProfileData({
                              name: user.name || '',
                              email: user.email || '',
                              phone: user.phone || '',
                              location: user.location || '',
                              bio: user.bio || '',
                              upiId: user.upiId || ''
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isSaving}
                          form="profile-form"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </>
                    ) :
                      <Button
                        type="button"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </Button>
                    }
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Badges Section */}
            <Card>
              <CardHeader>
                <CardTitle>Achievement Badges</CardTitle>
                <CardDescription>
                  Badges earned through your activity on BookLendiverse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BadgesDisplay 
                  badges={user?.badges || []} 
                  transactionCount={user?.transactionCount || 0} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Add Transaction History Tab */}
          <TabsContent value="rental-history" className="space-y-4">
            <TransactionHistory />
          </TabsContent>

          {/* Rest of existing tabs content... */}
          {activeTab === 'listing' && (
            <Card>
              <CardHeader>
                <CardTitle>My Books</CardTitle>
                <CardDescription>
                  Manage your listed and borrowed books
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* List New Book Section */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">List a New Book</h3>
                      <Button
                        onClick={() => setIsListingBook(!isListingBook)}
                        variant={isListingBook ? "destructive" : "default"}
                      >
                        {isListingBook ? 'Cancel' : 'List New Book'}
                      </Button>
                    </div>

                    {isListingBook && (
                      <form onSubmit={handleListBook} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <Input
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Author</label>
                            <Input
                              value={formData.author}
                              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                              required
                            />
                          </div>

                          {/* Transaction Type Toggle */}
                          <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Transaction Type</label>
                            <div className="flex gap-4">
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="transaction-rent"
                                  name="transactionType"
                                  value="rent"
                                  checked={formData.transactionType === 'rent'}
                                  onChange={() => setFormData({ ...formData, transactionType: 'rent' })}
                                  className="mr-2"
                                />
                                <label htmlFor="transaction-rent">Rent</label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="transaction-buy"
                                  name="transactionType"
                                  value="buy"
                                  checked={formData.transactionType === 'buy'}
                                  onChange={() => setFormData({ ...formData, transactionType: 'buy' })}
                                  className="mr-2"
                                />
                                <label htmlFor="transaction-buy">Sell</label>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              {formData.transactionType === 'rent' ? 'Rent Price (₹/day)' : 'Selling Price (₹)'}
                            </label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              required
                              placeholder={formData.transactionType === 'rent' ? 'Price per day' : 'One-time price'}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Genre</label>
                            <select
                              className="w-full rounded-md border border-gray-300 px-3 py-2"
                              value={formData.genre}
                              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                              required
                            >
                              <option value="">Select a genre</option>
                              <option value="fiction">Fiction</option>
                              <option value="non-fiction">Non-Fiction</option>
                              <option value="mystery">Mystery</option>
                              <option value="sci-fi">Science Fiction</option>
                              <option value="fantasy">Fantasy</option>
                              <option value="romance">Romance</option>
                              <option value="thriller">Thriller</option>
                              <option value="horror">Horror</option>
                              <option value="biography">Biography</option>
                              <option value="history">History</option>
                              <option value="children">Children's</option>
                              <option value="young-adult">Young Adult</option>
                              <option value="educational">Educational</option>
                              <option value="textbook">Textbook</option>
                              <option value="self-help">Self-Help</option>
                              <option value="poetry">Poetry</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-md font-medium">Book Location</h3>
                          
                          {/* Location Search */}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                placeholder="Search for a location (e.g. Mumbai Central, Delhi)"
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    searchLocation();
                                  }
                                }}
                              />
                            </div>
                            <Button 
                              type="button"
                              variant="secondary"
                              onClick={searchLocation}
                            >
                              Search
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Address</label>
                              <Input
                                value={formData.location.address}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  location: {
                                    ...formData.location,
                                    address: e.target.value
                                  }
                                })}
                                placeholder="Street address where the book is available"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">City</label>
                              <Input
                                value={formData.location.city}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  location: {
                                    ...formData.location,
                                    city: e.target.value
                                  }
                                })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">State</label>
                              <Input
                                value={formData.location.state}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  location: {
                                    ...formData.location,
                                    state: e.target.value
                                  }
                                })}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Add location search and map coordinates */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Map Location</h4>
                            <div className="flex space-x-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Use geolocation API to get current position
                                  if (navigator.geolocation) {
                                    toast.loading('Getting your current location...');
                                    navigator.geolocation.getCurrentPosition(
                                      (position) => {
                                        const { latitude, longitude } = position.coords;
                                        
                                        // Set the coordinates in the form
                                        setFormData({
                                          ...formData,
                                          location: {
                                            ...formData.location,
                                            coordinates: {
                                              lat: latitude,
                                              lng: longitude
                                            }
                                          }
                                        });
                                        
                                        // Use reverse geocoding to get address details
                                        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                                          .then(response => response.json())
                                          .then(data => {
                                            const address = data.address || {};
                                            
                                            setFormData(prevData => ({
                                              ...prevData,
                                              location: {
                                                ...prevData.location,
                                                address: address.road || address.street || '',
                                                city: address.city || address.town || address.village || '',
                                                state: address.state || ''
                                              }
                                            }));
                                            
                                            toast.dismiss();
                                            toast.success('Current location detected!');
                                          })
                                          .catch(error => {
                                            console.error('Error in reverse geocoding:', error);
                                            toast.dismiss();
                                            toast.success('Location coordinates set, but address lookup failed');
                                          });
                                      },
                                      (error) => {
                                        console.error('Error getting location:', error);
                                        toast.dismiss();
                                        toast.error('Could not get your location. Please check browser permissions.');
                                      }
                                    );
                                  } else {
                                    toast.error('Geolocation is not supported by your browser');
                                  }
                                }}
                              >
                                Use My Location
                              </Button>
                              
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Get coordinates from address using OpenStreetMap Nominatim API
                                  if (formData.location.address && formData.location.city) {
                                    const searchQuery = `${formData.location.address}, ${formData.location.city}, ${formData.location.state}`;
                                    
                                    toast.loading('Finding coordinates...');
                                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
                                      .then(response => response.json())
                                      .then(data => {
                                        toast.dismiss();
                                        if (data.length > 0) {
                                          const { lat, lon } = data[0];
                                          setFormData({
                                            ...formData,
                                            location: {
                                              ...formData.location,
                                              coordinates: {
                                                lat: parseFloat(lat),
                                                lng: parseFloat(lon)
                                              }
                                            }
                                          });
                                          toast.success('Location coordinates found!');
                                        } else {
                                          toast.error('Could not find coordinates for this address');
                                        }
                                      })
                                      .catch(error => {
                                        toast.dismiss();
                                        console.error('Error getting coordinates:', error);
                                        toast.error('Error finding location coordinates');
                                      });
                                  } else {
                                    toast.error('Please enter an address and city first');
                                  }
                                }}
                              >
                                Find Coordinates
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Latitude</label>
                              <Input
                                type="number"
                                step="0.000001"
                                value={formData.location.coordinates.lat || ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  location: {
                                    ...formData.location,
                                    coordinates: {
                                      ...formData.location.coordinates,
                                      lat: parseFloat(e.target.value)
                                    }
                                  }
                                })}
                                placeholder="e.g. 19.0760"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Longitude</label>
                              <Input
                                type="number"
                                step="0.000001"
                                value={formData.location.coordinates.lng || ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  location: {
                                    ...formData.location,
                                    coordinates: {
                                      ...formData.location.coordinates,
                                      lng: parseFloat(e.target.value)
                                    }
                                  }
                                })}
                                placeholder="e.g. 72.8777"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p>Accurate coordinates will help potential borrowers find your book on the map.</p>
                            {(formData.location.coordinates.lat !== 0 && formData.location.coordinates.lng !== 0) && (
                              <p className="text-green-600 mt-1">✓ Valid coordinates set</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Map preview section */}
                        {(formData.location.coordinates.lat !== 0 && formData.location.coordinates.lng !== 0) && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Location Preview</h4>
                            <div 
                              ref={mapPreviewRef} 
                              className="w-full h-[200px] border rounded-md overflow-hidden"
                              style={{ backgroundColor: '#f8f9fa' }}
                            >
                              {/* OpenLayers will render the map here */}
                              {!olLoaded && (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                  <MapPin className="h-5 w-5 mr-2" />
                                  <span>
                                    Location: {formData.location.coordinates.lat.toFixed(4)}, {formData.location.coordinates.lng.toFixed(4)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formData.location.address}, {formData.location.city}, {formData.location.state}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Book Cover Image</label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="mt-1"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Upload a high-quality image of your book cover (max 5MB)
                          </p>
                          {imageUrl && (
                            <div className="mt-2">
                              <img
                                src={imageUrl}
                                alt="Book cover preview"
                                className="h-32 w-auto object-cover rounded-md"
                              />
                            </div>
                          )}
                        </div>
                        <Button type="submit" className="w-full">
                          List Book
                        </Button>
                      </form>
                    )}
                  </div>

                  {/* Listed Books Section */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Your Listed Books</h2>
                      <Button onClick={() => setIsListingBook(true)}>List New Book</Button>
                    </div>

                    {isLoadingBooks ? (
                      <div className="text-center py-10">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
                        <p>Loading your books...</p>
                      </div>
                    ) : listedBooks.length === 0 ? (
                      <div className="text-center py-10 bg-muted/20 rounded-lg">
                        <Book className="h-16 w-16 mx-auto mb-4 text-muted-foreground/60" />
                        <h3 className="text-xl font-medium mb-2">No Books Listed Yet</h3>
                        <p className="text-muted-foreground mb-6">Start sharing your books with the community</p>
                        <Button onClick={() => setIsListingBook(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          List Your First Book
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {listedBooks.map((book) => (
                          <Card key={book._id} className="overflow-hidden">
                            <div className="aspect-[3/4] relative bg-muted/20">
                              {book.coverImage ? (
                                <img 
                                  src={book.coverImage} 
                                  alt={book.title}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/30">
                                  <BookOpen className="h-12 w-12 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-medium line-clamp-1">{book.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                              <div className="flex justify-between mt-2">
                                <span className="text-sm font-medium text-primary">${book.rentPrice}/day</span>
                                <span className="text-xs px-2 py-1 bg-muted rounded-full">{book.condition}</span>
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex justify-between">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/book/${book._id}`}>
                                  View Details
                                </Link>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemoveBook(book._id)}
                                className="text-destructive hover:text-destructive"
                              >
                                Remove
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Borrowed Books Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Borrowed Books</h3>
                    {borrowedBooksQuery.isLoading ? (
                      <p>Loading...</p>
                    ) : borrowedBooksQuery.data?.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {borrowedBooksQuery.data.map((book) => (
                          <BookCard key={book._id} book={book} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No borrowed books</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Notifications */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">
                          Receive updates about your books and account
                        </p>
                      </div>
                      <Switch
                        checked={settings?.emailNotifications}
                        onCheckedChange={value => handleSettingsUpdate('emailNotifications', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-500">
                          Get text messages for important updates
                        </p>
                      </div>
                      <Switch
                        checked={settings?.smsNotifications}
                        onCheckedChange={value => handleSettingsUpdate('smsNotifications', value)}
                      />
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Language</p>
                        <p className="text-sm text-gray-500">
                          Choose your preferred language
                        </p>
                      </div>
                      <select
                        value={settings?.language}
                        onChange={e => handleSettingsUpdate('language', e.target.value)}
                        className="form-select rounded-md border-gray-300"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                  </div>

                  {/* Currency */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Currency</p>
                        <p className="text-sm text-gray-500">
                          Set your preferred currency
                        </p>
                      </div>
                      <select
                        value={settings?.currency}
                        onChange={e => handleSettingsUpdate('currency', e.target.value)}
                        className="form-select rounded-md border-gray-300"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'bookmarks' && (
            <Card>
              <CardHeader>
                <CardTitle>Your Bookmarked Books</CardTitle>
                <CardDescription>Books you've bookmarked for later</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBookmarks ? (
                  <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading your bookmarks...</p>
                  </div>
                ) : bookmarkedBooks.length === 0 ? (
                  <div className="text-center py-10">
                    <BookHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No bookmarked books</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't bookmarked any books yet. Browse books and bookmark the ones you're interested in.
                    </p>
                    <Link href="/browse">
                      <Button>Browse Books</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarkedBooks.map((book) => (
                      <div key={book._id} className="group">
                        <BookCard 
                          book={book}
                          onLike={() => toggleBookmark(book._id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage; 