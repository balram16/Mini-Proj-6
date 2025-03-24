import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/db';
import { User } from '@/lib/models';
import auth from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const decoded = await auth.verifyToken(token);
      if (!decoded || !decoded.userId) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ message: 'Error fetching user profile' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const decoded = await auth.verifyToken(token);
      if (!decoded || !decoded.userId) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const { name, phone, location, bio } = req.body;

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update only the fields that are provided
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (location) user.location = location;
      if (bio) user.bio = bio;

      await user.save();

      // Return updated user without password
      const updatedUser = await User.findById(user._id).select('-password');
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ message: 'Error updating user profile' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 