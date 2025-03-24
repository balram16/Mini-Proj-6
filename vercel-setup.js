const fs = require('fs');
const path = require('path');

// This script helps with setting up the backend for Vercel deployment
console.log('Running Vercel setup script...');

// Create API endpoints in Next.js to proxy backend routes
const createApiProxyEndpoints = () => {
  // Directory where we'll create proxy endpoints
  const apiDir = path.join(__dirname, 'src', 'pages', 'api');

  // Ensure the main routes from backend are represented in Next.js API routes
  const routes = [
    'users',
    'books',
    'reviews',
    'borrow',
    'payments'
  ];

  // Create generic handler for each endpoint if it doesn't exist
  routes.forEach(route => {
    const routeDir = path.join(apiDir, route);
    const indexFile = path.join(routeDir, 'index.ts');

    // Create directory if it doesn't exist
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    // Only create the file if it doesn't exist already
    if (!fs.existsSync(indexFile)) {
      const template = `
import { NextApiRequest, NextApiResponse } from 'next';
import { apiHandler } from '@/lib/api-handler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, '/${route}');
}
      `;
      fs.writeFileSync(indexFile, template.trim());
      console.log(`Created API proxy for ${route}`);
    }
  });
};

// Create a helper to forward requests to backend API
const createApiHandler = () => {
  const libDir = path.join(__dirname, 'src', 'lib');
  const handlerFile = path.join(libDir, 'api-handler.ts');

  // Ensure the lib directory exists
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  const handlerContent = `
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
    const fullEndpoint = queryString ? \`\${endpoint}?\${queryString}\` : endpoint;
    
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
  `;

  fs.writeFileSync(handlerFile, handlerContent.trim());
  console.log('Created API handler utility');
};

// Run setup
try {
  createApiHandler();
  createApiProxyEndpoints();
  console.log('Vercel setup completed successfully');
} catch (error) {
  console.error('Vercel setup failed:', error);
  process.exit(1);
} 