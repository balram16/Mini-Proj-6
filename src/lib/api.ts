/**
 * API configuration helper for BookLendiverse application
 * This centralizes the API URL configuration for easier deployment
 */

// Determine the base API URL based on environment
let baseApiUrl = '/api';

// In production, allow overriding with environment variable
if (process.env.NEXT_PUBLIC_API_URL) {
  baseApiUrl = process.env.NEXT_PUBLIC_API_URL;
}
// In development, use localhost
else if (process.env.NODE_ENV === 'development') {
  baseApiUrl = 'http://localhost:5000/api';
}

export const API_BASE_URL = baseApiUrl;

/**
 * Returns the full URL for an API endpoint
 * @param endpoint The API endpoint (should start with a slash)
 * @returns Full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  // If endpoint already starts with http, return as is (for external APIs)
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Make sure endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${API_BASE_URL}${formattedEndpoint}`;
};

/**
 * Get default headers for API requests including auth token if available
 */
export const getDefaultHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    headers['x-auth-token'] = token;
  }
  
  return headers;
};

/**
 * Helper function to make API requests with proper error handling
 */
export const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  try {
    const url = getApiUrl(endpoint);
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getDefaultHeaders(),
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}; 