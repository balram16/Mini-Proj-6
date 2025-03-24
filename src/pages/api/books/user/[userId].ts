import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const { db } = await connectToDatabase();

    switch (method) {
      case 'GET': {
        const books = await db.collection('books')
          .find({ seller: new ObjectId(userId) })
          .sort({ createdAt: -1 })
          .toArray();

        return res.status(200).json(books);
      }

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in user books API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 