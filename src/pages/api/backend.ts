import { NextApiRequest, NextApiResponse } from 'next';
import { apiHandler } from '@/lib/api-handler';

// This is a catch-all API route that forwards requests to the backend
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, req.url?.replace('/api/backend', '') || '/');
} 