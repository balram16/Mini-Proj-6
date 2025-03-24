import { BookOpen } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-book-primary text-white py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-book-accent" />
              <span className="text-xl font-semibold font-serif">BookHive</span>
            </Link>
            <p className="text-white/70 text-sm">
              Connecting book lovers with their next great read.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/books" className="text-white/70 hover:text-white transition-colors">Browse Books</Link></li>
              <li><Link href="/nearby" className="text-white/70 hover:text-white transition-colors">Books Near You</Link></li>
              <li><Link href="/forum" className="text-white/70 hover:text-white transition-colors">Community Forum</Link></li>
              <li><Link href="/how-it-works" className="text-white/70 hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-white/70 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-white/70 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/terms" className="text-white/70 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-white/70 text-sm mb-4">
              Subscribe to our newsletter for the latest updates and book recommendations.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-book-accent"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-book-accent text-white rounded-md hover:bg-book-accent/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} BookHive. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-white/50 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white/50 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
