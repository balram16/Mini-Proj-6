import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/db';
import ForumPost from '@/lib/models/ForumPost';
import auth from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const { search, tag, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build query
      const query: any = {};
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ];
      }
      if (tag && tag !== 'all') {
        query.tags = tag;
      }

      // Get total count for pagination
      const total = await ForumPost.countDocuments(query);

      // Get posts with pagination
      const posts = await ForumPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('author', 'name email')
        .populate('comments.author', 'name email');

      return res.status(200).json({
        posts,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Error fetching forum posts:', error);
      return res.status(500).json({ message: 'Error fetching forum posts' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Verify authentication
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const decoded = auth.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const { title, content, tags } = req.body;

      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const post = await ForumPost.create({
        title,
        content,
        tags: tags || [],
        author: decoded.userId,
      });

      await post.populate('author', 'name email');

      return res.status(201).json(post);
    } catch (error) {
      console.error('Error creating forum post:', error);
      return res.status(500).json({ message: 'Error creating forum post' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 