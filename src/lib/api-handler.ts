import { NextApiRequest, NextApiResponse } from 'next';
import { getApiUrl } from './api';

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

    // Get the full endpoint URL including any query parameters
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    // Forward the request to the backend
    const backendUrl = getApiUrl(fullEndpoint);
    
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization as string } : {}),
        ...(req.headers['x-auth-token'] ? { 'x-auth-token': req.headers['x-auth-token'] as string } : {})
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Get the response data
    const data = await response.text();
    let responseData;
    
    // Try to parse as JSON if possible
    try {
      responseData = JSON.parse(data);
    } catch (e) {
      responseData = data;
    }

    // Return the response with the same status
    return res.status(response.status).json(responseData);
  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}