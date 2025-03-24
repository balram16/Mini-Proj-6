import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get token from cookie
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    // Find user and populate borrowed and listed books
    const user = await User.findById(userId)
      .select('-password')
      .populate('borrowedBooks')
      .populate('listedBooks');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return complete user profile
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      settings: user.settings || {
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
        currency: 'USD',
      },
      borrowedBooks: user.borrowedBooks,
      listedBooks: user.listedBooks,
      paymentMethods: user.paymentMethods || [],
    };

    return res.status(200).json(userResponse);
  } catch (error: any) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
} 