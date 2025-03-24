// Update the mock books to include location coordinates

export const getBooks = () => {
  return [
    {
      _id: "1",
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      description: "A powerful story of a lawyer in the Deep South defending a black man charged with the rape of a white girl.",
      coverImage: "https://source.unsplash.com/random/400×600/?book,classic",
      price: 9.99,
      rentPrice: 3.99,
      condition: "Good",
      genre: ["Fiction", "Classic"],
      owner: "John Doe",
      available: true,
      createdAt: "2023-05-10T10:30:00Z",
      likes: ["user1", "user2"],
      comments: [],
      rating: 4.8,
      location: {
        address: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        coordinates: {
          lat: 19.076, 
          lng: 72.8777
        }
      }
    },
    {
      _id: "2",
      title: "1984",
      author: "George Orwell",
      description: "A dystopian novel about a totalitarian regime where the government controls every aspect of people's lives.",
      coverImage: "https://source.unsplash.com/random/400×600/?book,dystopian",
      price: 8.99,
      rentPrice: 2.99,
      condition: "Like New",
      genre: ["Science Fiction", "Dystopian"],
      owner: "Jane Smith",
      available: true,
      createdAt: "2023-05-15T14:20:00Z",
      likes: ["user3"],
      comments: [],
      rating: 4.6,
      location: {
        address: "456 Park Ave",
        city: "Delhi",
        state: "Delhi",
        coordinates: {
          lat: 28.7041, 
          lng: 77.1025
        }
      }
    },
    {
      _id: "3",
      title: "Pride and Prejudice",
      author: "Jane Austen",
      description: "A romantic novel about the emotional development of Elizabeth Bennet, who learns the error of making hasty judgments.",
      coverImage: "https://source.unsplash.com/random/400×600/?book,romance",
      price: 7.99,
      rentPrice: 2.49,
      condition: "Good",
      genre: ["Romance", "Classic"],
      owner: "Emily Johnson",
      available: false,
      createdAt: "2023-05-20T09:15:00Z",
      likes: [],
      comments: [],
      rating: 4.5,
      location: {
        address: "789 Oak St",
        city: "Bangalore",
        state: "Karnataka",
        coordinates: {
          lat: 12.9716, 
          lng: 77.5946
        }
      }
    },
    {
      _id: "4",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      description: "A novel about the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan, set in the Roaring Twenties.",
      coverImage: "https://source.unsplash.com/random/400×600/?book,gatsby",
      price: 9.49,
      rentPrice: 3.49,
      condition: "Acceptable",
      genre: ["Fiction", "Classic"],
      owner: "Michael Brown",
      available: true,
      createdAt: "2023-05-25T16:45:00Z",
      likes: ["user1"],
      comments: [],
      rating: 4.3,
      location: {
        address: "101 Pine St",
        city: "Chennai",
        state: "Tamil Nadu",
        coordinates: {
          lat: 13.0827, 
          lng: 80.2707
        }
      }
    },
    {
      _id: "5",
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      description: "A fantasy novel about the adventures of hobbit Bilbo Baggins, who is recruited by the wizard Gandalf to help a group of dwarves.",
      coverImage: "https://source.unsplash.com/random/400×600/?book,fantasy",
      price: 10.99,
      rentPrice: 3.99,
      condition: "Very Good",
      genre: ["Fantasy", "Adventure"],
      owner: "David Wilson",
      available: true,
      createdAt: "2023-06-01T11:30:00Z",
      likes: ["user2", "user3"],
      comments: [],
      rating: 4.7,
      location: {
        address: "321 Maple Dr",
        city: "Hyderabad",
        state: "Telangana",
        coordinates: {
          lat: 17.3850, 
          lng: 78.4867
        }
      }
    },
    {
      _id: "6",
      title: "Brave New World",
      author: "Aldous Huxley",
      description: "A dystopian novel set in a futuristic World State, inhabited by genetically modified citizens and an intelligence-based social hierarchy.",
      coverImage: "https://source.unsplash.com/random/400×600/?book,scifi",
      price: 8.99,
      rentPrice: 2.99,
      condition: "Good",
      genre: ["Science Fiction", "Dystopian"],
      owner: "Sarah Adams",
      available: true,
      createdAt: "2023-06-05T13:20:00Z",
      likes: [],
      comments: [],
      rating: 4.2,
      location: {
        address: "654 Cedar Ln",
        city: "Kolkata",
        state: "West Bengal",
        coordinates: {
          lat: 22.5726, 
          lng: 88.3639
        }
      }
    },
    {
      _id: "7",
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      description: "A novel about the adolescent protagonist Holden Caulfield and his experiences in New York City.",
      coverImage: "https://source.unsplash.com/random/400×600/?book,classic",
      price: 8.49,
      rentPrice: 2.79,
      condition: "Good",
      genre: ["Fiction", "Coming of Age"],
      owner: "Robert Thomas",
      available: true,
      createdAt: "2023-06-10T09:45:00Z",
      likes: ["user1"],
      comments: [],
      rating: 4.1,
      location: {
        address: "987 Elm St",
        city: "Pune",
        state: "Maharashtra",
        coordinates: {
          lat: 18.5204, 
          lng: 73.8567
        }
      }
    },
    {
      _id: "8",
      title: "Moby Dick",
      author: "Herman Melville",
      description: "A novel about the voyage of the whaling ship Pequod, commanded by Captain Ahab, who seeks revenge on Moby Dick, the white whale.",
      coverImage: "https://source.unsplash.com/random/400×600/?book,ocean",
      price: 9.99,
      rentPrice: 3.49,
      condition: "Acceptable",
      genre: ["Adventure", "Classic"],
      owner: "Lisa Parker",
      available: true,
      createdAt: "2023-06-15T15:10:00Z",
      likes: [],
      comments: [],
      rating: 4.0,
      location: {
        address: "543 Birch Rd",
        city: "Ahmedabad",
        state: "Gujarat",
        coordinates: {
          lat: 23.0225, 
          lng: 72.5714
        }
      }
    },
    {
      _id: "9",
      title: "Wuthering Heights",
      author: "Emily Brontë",
      description: "A novel about the passionate and destructive love between Heathcliff and Catherine Earnshaw.",
      coverImage: "https://source.unsplash.com/random/400×600/?book,gothic",
      price: 7.99,
      rentPrice: 2.49,
      condition: "Good",
      genre: ["Romance", "Gothic"],
      owner: "Jennifer Miller",
      available: false,
      createdAt: "2023-06-20T10:30:00Z",
      likes: ["user3"],
      comments: [],
      rating: 4.4,
      location: {
        address: "876 Cherry Ave",
        city: "Jaipur",
        state: "Rajasthan",
        coordinates: {
          lat: 26.9124, 
          lng: 75.7873
        }
      }
    },
    {
      _id: "10",
      title: "The Alchemist",
      author: "Paulo Coelho",
      description: "A novel about a young Andalusian shepherd who yearns to travel in search of a worldly treasure.",
      coverImage: "https://source.unsplash.com/random/400×600/?book,journey",
      price: 8.99,
      rentPrice: 2.99,
      condition: "Like New",
      genre: ["Fiction", "Philosophy"],
      owner: "Daniel Green",
      available: true,
      createdAt: "2023-06-25T14:15:00Z",
      likes: ["user1", "user2"],
      comments: [],
      rating: 4.5,
      location: {
        address: "234 Walnut St",
        city: "Lucknow",
        state: "Uttar Pradesh",
        coordinates: {
          lat: 26.8467, 
          lng: 80.9462
        }
      }
    }
  ];
};

export const getBookById = (id) => {
  const books = getBooks();
  return books.find(book => book._id === id) || null;
};

// Add some utility function to calculate distance between two coordinates (for map feature)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
}; 