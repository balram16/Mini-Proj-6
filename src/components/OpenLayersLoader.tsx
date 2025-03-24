import { useEffect, useState } from 'react';
import Script from 'next/script';
import Head from 'next/head';

interface OpenLayersLoaderProps {
  onLoad?: () => void;
}

export const OpenLayersLoader: React.FC<OpenLayersLoaderProps> = ({ onLoad }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if OpenLayers is already loaded
    if (window.ol) {
      setIsLoaded(true);
      if (onLoad) onLoad();
      return;
    }
  }, [onLoad]);

  const handleScriptLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@v7.4.0/ol.css" />
      </Head>
      {!isLoaded && (
        <Script
          src="https://cdn.jsdelivr.net/npm/ol@v7.4.0/dist/ol.js"
          onLoad={handleScriptLoad}
          strategy="afterInteractive"
        />
      )}
    </>
  );
};

// Add this to keep TypeScript happy
declare global {
  interface Window {
    ol: any;
  }
} 