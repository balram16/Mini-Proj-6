import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Generic API handler that forwards requests to the backend API
 */
export async function apiHandler(
  req: NextApiRequest, 
  res: NextApiResponse, 
  endpoint: string
) {
  try {
    // Skip OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // For Vercel deployment, we'll handle API requests directly
    // This is a simplified handler that returns mock data
    if (endpoint.includes('/users')) {
      return res.status(200).json({ message: 'User API endpoint' });
    }
    
    if (endpoint.includes('/books')) {
      return res.status(200).json([
        { 
          _id: '1', 
          title: 'Sample Book', 
          author: 'Author Name',
          description: 'Book description',
          price: 15.99,
          genre: 'fiction',
          condition: 'Good',
          coverImage: '/images/sample.jpg',
          seller: { _id: '1', name: 'Seller Name' }
        }
      ]);
    }
    
    if (endpoint.includes('/reviews')) {
      return res.status(200).json([
        { _id: '1', text: 'Great book!', rating: 5, user: { _id: '1', name: 'User Name' } }
      ]);
    }
    
    if (endpoint.includes('/borrow')) {
      return res.status(200).json({ message: 'Borrow API endpoint' });
    }
    
    if (endpoint.includes('/payments')) {
      return res.status(200).json({ message: 'Payments API endpoint' });
    }

    // Default response
    return res.status(200).json({ message: 'API endpoint' });
  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}