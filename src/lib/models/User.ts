import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  bio?: string;
  settings?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    language: string;
    currency: string;
  };
  borrowedBooks: mongoose.Types.ObjectId[];
  listedBooks: mongoose.Types.ObjectId[];
  paymentMethods: {
    id: string;
    type: 'credit_card' | 'debit_card';
    last4: string;
    isDefault: boolean;
  }[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't include password in queries by default
    },
    phone: {
      type: String,
    },
    location: {
      type: String,
    },
    bio: {
      type: String,
    },
    settings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
      language: {
        type: String,
        default: 'en',
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    borrowedBooks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    }],
    listedBooks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    }],
    paymentMethods: [{
      id: String,
      type: {
        type: String,
        enum: ['credit_card', 'debit_card'],
      },
      last4: String,
      isDefault: Boolean,
    }],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Register the User model
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export { User }; 