import { useEffect } from 'react';
import Link from 'next/link';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import FeaturedBooks from '@/components/FeaturedBooks';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <FeaturedBooks />
        
        {/* How It Works Section */}
        <section className="py-24 bg-muted/50">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center mb-16">
              <span className="text-primary font-semibold text-sm tracking-wider">SIMPLE PROCESS</span>
              <h2 className="text-3xl font-bold text-foreground mt-1">How BookLendiverse Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
                A seamless experience from browsing to reading. Follow these simple steps to start your reading journey.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Step 1 */}
              <div className="text-center p-6 bg-card rounded-lg shadow-sm relative">
                <div className="w-16 h-16 flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold rounded-full mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Browse & Select</h3>
                <p className="text-muted-foreground text-sm">
                  Search for books by title, author, or genre. Filter by location, availability, and rental duration to find the perfect match.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="text-center p-6 bg-card rounded-lg shadow-sm relative">
                <div className="w-16 h-16 flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold rounded-full mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Reserve & Pay</h3>
                <p className="text-muted-foreground text-sm">
                  Reserve your book and complete the secure payment process. All transactions are protected with our blockchain-based payment system.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="text-center p-6 bg-card rounded-lg shadow-sm relative">
                <div className="w-16 h-16 flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold rounded-full mx-auto mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Pick Up & Enjoy</h3>
                <p className="text-muted-foreground text-sm">
                  Arrange a pickup with the book owner, collect your book, and dive into your reading adventure. Return when your rental period ends.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link href="/browse">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 w-80 h-80 border border-white/30 rounded-full"></div>
            <div className="absolute left-10 bottom-10 w-40 h-40 border border-white/20 rounded-full"></div>
            <div className="absolute right-1/4 bottom-1/3 w-60 h-60 border border-white/10 rounded-full"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join Our Community of Book Lovers
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Whether you want to rent out your books or find your next great read, BookLendiverse makes it easy to connect with fellow readers in your area.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link href="/dashboard?tab=listing">
                  <Button className="bg-white text-primary hover:bg-white/90">
                    List Your Books
                  </Button>
                </Link>
                <Link href="/browse">
                  <Button variant="outline" className="border-white/30 hover:bg-white/10">
                    Start Browsing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
