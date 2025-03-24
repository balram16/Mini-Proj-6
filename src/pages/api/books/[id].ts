import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid book ID' });
  }

  try {
    const { db } = await connectToDatabase();

    switch (method) {
      case 'DELETE': {
        // Find the book first to get the seller ID
        const book = await db.collection('books').findOne({ _id: new ObjectId(id) });
        
        if (!book) {
          return res.status(404).json({ error: 'Book not found' });
        }

        // Delete the book
        await db.collection('books').deleteOne({ _id: new ObjectId(id) });

        // Remove the book from the seller's listedBooks array
        if (book.seller) {
          await db.collection('users').updateOne(
            { _id: book.seller },
            { $pull: { listedBooks: new ObjectId(id) } }
          );
        }

        return res.status(200).json({ message: 'Book removed successfully' });
      }

      default:
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in book API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 