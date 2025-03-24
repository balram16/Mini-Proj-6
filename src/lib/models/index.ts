import mongoose from 'mongoose';
import { Book } from './Book';
import { User } from './User';

// Ensure models are registered
const models = {
  Book: Book,
  User: User,
};

export { Book, User }; 