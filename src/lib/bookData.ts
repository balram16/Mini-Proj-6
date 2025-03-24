export interface BookType {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  genre: string[];
  rating: number;
  rentPrice: number;
  rentPeriod: string;
  owner: {
    id: string;
    name: string;
    rating: number;
    location: string;
  };
  available: boolean;
  availableFrom?: string;
  minRentalDuration?: string;
  securityDeposit?: number;
  pickupMethod?: string;
  condition?: string;
  language?: string;
  isbn?: string;
  publisher?: string;
}

export const featuredBooks: BookType[] = [
  {
    id: "1",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80",
    description: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows overlooking a park in one of London's most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.",
    genre: ["Thriller", "Mystery", "Psychological Fiction"],
    rating: 4.5,
    rentPrice: 3.99,
    rentPeriod: "2 weeks",
    owner: {
      id: "101",
      name: "Emma Thompson",
      rating: 4.8,
      location: "San Francisco, CA"
    },
    available: true
  },
  {
    id: "2",
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    description: "For years, rumors of the 'Marsh Girl' have haunted Barkley Cove, a quiet town on the North Carolina coast. So in late 1969, when handsome Chase Andrews is found dead, the locals immediately suspect Kya Clark, the so-called Marsh Girl. But Kya is not what they say.",
    genre: ["Literary Fiction", "Coming-of-Age", "Mystery"],
    rating: 4.7,
    rentPrice: 4.50,
    rentPeriod: "3 weeks",
    owner: {
      id: "102",
      name: "Michael Johnson",
      rating: 4.6,
      location: "Austin, TX"
    },
    available: true
  },
  {
    id: "3",
    title: "Educated",
    author: "Tara Westover",
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=928&q=80",
    description: "Born to survivalists in the mountains of Idaho, Tara Westover was 17 the first time she set foot in a classroom. Her family was so isolated from mainstream society that there was no one to ensure the children received an education, and no one to intervene when one of Tara's older brothers became violent.",
    genre: ["Memoir", "Biography", "Autobiography"],
    rating: 4.8,
    rentPrice: 3.50,
    rentPeriod: "2 weeks",
    owner: {
      id: "103",
      name: "Sophia Lee",
      rating: 4.9,
      location: "Chicago, IL"
    },
    available: true
  },
  {
    id: "4",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    coverImage: "https://images.unsplash.com/photo-1531072901668-789a13ef9501?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=735&q=80",
    description: "The story primarily concerns the young and mysterious millionaire Jay Gatsby and his quixotic passion and obsession with the beautiful former debutante Daisy Buchanan.",
    genre: ["Classic", "Literary Fiction"],
    rating: 4.2,
    rentPrice: 2.99,
    rentPeriod: "2 weeks",
    owner: {
      id: "104",
      name: "David Wilson",
      rating: 4.5,
      location: "New York, NY"
    },
    available: true
  },
  {
    id: "5",
    title: "Becoming",
    author: "Michelle Obama",
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=912&q=80",
    description: "In her memoir, a work of deep reflection and mesmerizing storytelling, Michelle Obama invites readers into her world, chronicling the experiences that have shaped her—from her childhood on the South Side of Chicago to her years as an executive balancing the demands of motherhood and work, to her time spent at the world's most famous address.",
    genre: ["Memoir", "Autobiography", "Politics"],
    rating: 4.9,
    rentPrice: 4.99,
    rentPeriod: "3 weeks",
    owner: {
      id: "105",
      name: "Jennifer Martinez",
      rating: 4.7,
      location: "Seattle, WA"
    },
    available: true
  },
  {
    id: "6",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    coverImage: "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    description: "From a renowned historian comes a groundbreaking narrative of humanity's creation and evolution that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be human.",
    genre: ["Non-fiction", "History", "Science"],
    rating: 4.6,
    rentPrice: 3.75,
    rentPeriod: "3 weeks",
    owner: {
      id: "106",
      name: "Robert Brown",
      rating: 4.4,
      location: "Boston, MA"
    },
    available: true
  }
];

export const allBooks: BookType[] = [
  ...featuredBooks,
  {
    id: "7",
    title: "The Alchemist",
    author: "Paulo Coelho",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    description: "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. His quest will lead him to riches far different—and far more satisfying—than he ever imagined.",
    genre: ["Fiction", "Philosophy", "Fantasy"],
    rating: 4.7,
    rentPrice: 3.25,
    rentPeriod: "2 weeks",
    owner: {
      id: "107",
      name: "Maria Garcia",
      rating: 4.8,
      location: "Miami, FL"
    },
    available: true
  },
  {
    id: "8",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    coverImage: "https://images.unsplash.com/photo-1495640388908-25ae0a9ec5e6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. Through the young eyes of Scout and Jem Finch, Harper Lee explores with rich humor and unswerving honesty the irrationality of adult attitudes toward race and class in the Deep South of the 1930s.",
    genre: ["Classic", "Historical Fiction", "Coming-of-Age"],
    rating: 4.8,
    rentPrice: 2.99,
    rentPeriod: "2 weeks",
    owner: {
      id: "108",
      name: "John Davis",
      rating: 4.5,
      location: "Atlanta, GA"
    },
    available: true
  },
  {
    id: "9",
    title: "1984",
    author: "George Orwell",
    coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    description: "Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real. Published in 1949, the book offers political satirist George Orwell's nightmarish vision of a totalitarian, bureaucratic world and one poor stiff's attempt to find individuality.",
    genre: ["Dystopian", "Science Fiction", "Classic"],
    rating: 4.5,
    rentPrice: 3.49,
    rentPeriod: "2 weeks",
    owner: {
      id: "109",
      name: "Thomas Anderson",
      rating: 4.6,
      location: "Portland, OR"
    },
    available: true
  },
  {
    id: "10",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    coverImage: "https://images.unsplash.com/photo-1629992101753-56d196c8aabb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=690&q=80",
    description: "Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling further than the pantry of his hobbit-hole in Bag End. But his contentment is disturbed when the wizard, Gandalf, and a company of thirteen dwarves arrive on his doorstep one day to whisk him away on an unexpected journey 'there and back again'.",
    genre: ["Fantasy", "Adventure", "Classic"],
    rating: 4.6,
    rentPrice: 3.99,
    rentPeriod: "3 weeks",
    owner: {
      id: "110",
      name: "Sarah Johnson",
      rating: 4.9,
      location: "Denver, CO"
    },
    available: true
  },
  {
    id: "11",
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: "https://images.unsplash.com/photo-1555431189-0fabf2667795?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    genre: ["Self-help", "Personal Development", "Psychology"],
    rating: 4.9,
    rentPrice: 4.25,
    rentPeriod: "2 weeks",
    owner: {
      id: "111",
      name: "Kevin Miller",
      rating: 4.7,
      location: "Nashville, TN"
    },
    available: true
  },
  {
    id: "12",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    coverImage: "https://images.unsplash.com/photo-1603162588651-5899b200ebae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=928&q=80",
    description: "Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language. Jane Austen called this brilliant work 'her own darling child' and its vivacious heroine, Elizabeth Bennet, 'as delightful a creature as ever appeared in print.'",
    genre: ["Classic", "Romance", "Literary Fiction"],
    rating: 4.7,
    rentPrice: 2.75,
    rentPeriod: "2 weeks",
    owner: {
      id: "112",
      name: "Amanda Clark",
      rating: 4.8,
      location: "Philadelphia, PA"
    },
    available: true
  }
];

export const getBookById = (id: string): BookType | undefined => {
  return allBooks.find(book => book.id === id);
};

export const getBooksByGenre = (genre: string): BookType[] => {
  return allBooks.filter(book => book.genre.includes(genre));
};

export const searchBooks = (query: string): BookType[] => {
  const lowerCaseQuery = query.toLowerCase();
  return allBooks.filter(
    book => 
      book.title.toLowerCase().includes(lowerCaseQuery) || 
      book.author.toLowerCase().includes(lowerCaseQuery) ||
      book.genre.some(g => g.toLowerCase().includes(lowerCaseQuery))
  );
};
