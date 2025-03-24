import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare, Share2, Star, BookOpen, MapPin } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface BookCardProps {
  book: {
    _id: string;
    title: string;
    author: string;
    coverImage: string;
    price?: number;
    rentPrice?: number;
    transactionType?: 'rent' | 'buy';
    rating?: number;
    condition: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      coordinates?: {
        lat: number;
        lng: number;
      }
    };
    createdAt: string;
    likes: string[];
    comments: any[];
    available?: boolean;
  };
  onBookmark?: () => void;
  onShare?: () => void;
}

export const BookCard = ({ book, onBookmark, onShare }: BookCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  const getImageSrc = () => {
    if (imageError || !book.coverImage) {
      // Use a fallback image if the original fails
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&size=400&background=random`;
    }
    return book.coverImage;
  };

  const getLocationString = () => {
    if (!book.location) return 'Location not specified';
    
    return [
      book.location.city,
      book.location.state
    ].filter(Boolean).join(', ') || 'Location not specified';
  };
  
  const formatPrice = (price?: number) => {
    if (!price) return 'Price not available';
    return `₹${price.toFixed(2)}${book.transactionType === 'rent' ? '/day' : ''}`;
  };

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-all duration-300">
      <Link href={`/book/${book._id}`}>
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
          <img
            src={getImageSrc()}
            alt={book.title}
            onError={handleImageError}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          {book.available === false && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-semibold px-4 py-2 border-2 border-white rounded-md">
                Not Available
              </span>
            </div>
          )}
          <div className="absolute top-0 right-0 p-2">
            <Badge variant="secondary" className="capitalize bg-background/80 backdrop-blur-sm">
              {book.condition}
            </Badge>
          </div>
          {book.rating && (
            <div className="absolute bottom-0 left-0 p-2">
              <Badge variant="secondary" className="flex items-center gap-1 bg-background/80 backdrop-blur-sm">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{book.rating}</span>
              </Badge>
            </div>
          )}
        </div>
      </Link>
      <CardHeader className="p-4">
        <Link href={`/book/${book._id}`}>
          <CardTitle className="text-lg line-clamp-1 hover:text-primary transition-colors">
            {book.title}
          </CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground">{book.author}</p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">
            {book.transactionType === 'rent' 
              ? formatPrice(book.rentPrice) 
              : formatPrice(book.price)}
          </span>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate max-w-[100px]">{getLocationString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onBookmark}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <Link href={`/book/${book._id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

