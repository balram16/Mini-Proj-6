import { NextApiRequest, NextApiResponse } from 'next';
import { apiHandler } from '@/lib/api-handler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, '/reviews');
}