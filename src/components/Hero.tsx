import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden px-6 md:px-10">
      {/* Background image with parallax effect */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-primary opacity-40"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2090&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollPosition * 0.3}px)`,
            transition: 'transform 0.1s linear',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary/40"></div>
      </div>
      
      {/* Floating book shapes */}
      <div className="absolute w-28 h-40 bg-book-paper rounded-sm shadow-xl top-1/4 -left-5 rotate-12 animate-book-bounce opacity-60"></div>
      <div className="absolute w-36 h-52 bg-book-paper rounded-sm shadow-xl bottom-1/3 -right-10 -rotate-6 animate-book-bounce opacity-60" style={{ animationDelay: '1s' }}></div>
      
      {/* Hero content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
        <div className="space-y-2 mb-8">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs font-medium rounded-full">Revolutionizing Book Borrowing</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Borrow Books from People in Your Community
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Access thousands of books at a fraction of the cost. Rent directly from book owners near you and build a community of readers.
          </p>
        </div>
        
        {/* Search box */}
        <form 
          onSubmit={handleSubmit}
          className="relative w-full max-w-2xl mx-auto transform translate-y-0 transition-all duration-300 group"
        >
          <div className="relative flex items-center">
            <div className="absolute left-4 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search by title, author, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-12 pr-32 py-4 bg-white/90 backdrop-blur-md rounded-full shadow-sm",
                "text-primary placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/30",
                "transition-all duration-300"
              )}
            />
            <button 
              type="submit"
              className={cn(
                "absolute right-2 bg-primary text-white px-6 py-2 rounded-full font-medium text-sm",
                "transform transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95",
                searchQuery.trim() === '' && "opacity-70 cursor-not-allowed"
              )}
              disabled={searchQuery.trim() === ''}
            >
              Search
            </button>
          </div>
        </form>
        
        {/* Quick categories */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {['Fiction', 'Non-fiction', 'Fantasy', 'Self-help', 'Mystery', 'Biography'].map((category) => (
            <Link 
              key={category}
              href={`/browse?genre=${category}`}
            >
              <Button variant="ghost" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white">
                {category}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white/70 animate-bounce">
        <span className="text-sm mb-2">Scroll to Explore</span>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
};

export default Hero;
