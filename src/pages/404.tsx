'use client';

import Link from 'next/link';
import { Home, ArrowLeft, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <BookOpen className="mx-auto h-24 w-24 text-book-accent" />
        </div>
        
        <h1 className="text-9xl font-serif font-bold text-book-primary mb-4">404</h1>
        <h2 className="text-2xl font-medium text-book-secondary mb-2">Page Not Found</h2>
        <p className="text-book-secondary mb-8">
          Oops! It seems this page has been borrowed and not returned yet.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-book-accent hover:bg-book-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-book-accent transition-colors duration-200"
          >
            <Home className="h-5 w-5 mr-2" />
            Return Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-book-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-book-accent transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>

        <p className="mt-8 text-sm text-book-secondary">
          Lost? Try searching for books in our{' '}
          <Link href="/browse" className="text-book-accent hover:underline">
            library
          </Link>
          .
        </p>
      </div>
    </div>
  );
} 