import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { UserProvider } from '@/lib/contexts/UserContext';
import { Toaster } from 'react-hot-toast';
import '../index.css';

// Create a client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <UserProvider>
          <Component {...pageProps} />
          <Toaster position="top-right" />
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
} 