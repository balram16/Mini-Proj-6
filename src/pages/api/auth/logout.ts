import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Clear the token cookie
    res.setHeader(
      'Set-Cookie',
      'token=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict'
    );

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
} 