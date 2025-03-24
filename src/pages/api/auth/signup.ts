import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import { User } from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    return res.status(201).json(userResponse);
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
} 