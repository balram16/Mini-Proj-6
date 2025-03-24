export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  location: string;
  phone?: string;
  bio?: string;
  joinedDate: string;
  borrowedBooks: string[]; // Array of book IDs
  listedBooks: string[]; // Array of book IDs
  paymentMethods: PaymentMethod[];
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: string;
  currency: string;
}

export type UserContextType = {
  user: UserProfile | null;
  settings: UserSettings | null;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
};

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  bookId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: ForumComment[];
}

export interface ForumComment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface BookType {
  location: Location;
  distance?: number;
} 