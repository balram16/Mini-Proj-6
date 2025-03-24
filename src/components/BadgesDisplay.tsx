import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Award, BookIcon, Shield, Star, TrendingUp, User } from "lucide-react";

interface BadgeDisplayProps {
  badges: string[];
  transactionCount: number;
}

const getBadgeIcon = (badge: string) => {
  switch (badge) {
    case 'new_user':
      return <User className="h-4 w-4" />;
    case 'bronze_lender':
      return <Award className="h-4 w-4 text-amber-700" />;
    case 'silver_lender':
      return <Award className="h-4 w-4 text-gray-400" />;
    case 'gold_lender':
      return <Award className="h-4 w-4 text-yellow-400" />;
    case 'platinum_lender':
      return <Award className="h-4 w-4 text-indigo-400" />;
    case 'trusted_user':
      return <Shield className="h-4 w-4 text-blue-600" />;
    case 'book_enthusiast':
      return <BookIcon className="h-4 w-4 text-green-600" />;
    case 'book_worm':
      return <BookIcon className="h-4 w-4 text-purple-600" />;
    case 'book_collector':
      return <BookIcon className="h-4 w-4 text-red-600" />;
    default:
      return <Star className="h-4 w-4" />;
  }
};

const getBadgeTitle = (badge: string) => {
  switch (badge) {
    case 'new_user':
      return 'New User';
    case 'bronze_lender':
      return 'Bronze Lender';
    case 'silver_lender':
      return 'Silver Lender';
    case 'gold_lender':
      return 'Gold Lender';
    case 'platinum_lender':
      return 'Platinum Lender';
    case 'trusted_user':
      return 'Trusted User';
    case 'book_enthusiast':
      return 'Book Enthusiast';
    case 'book_worm':
      return 'Book Worm';
    case 'book_collector':
      return 'Book Collector';
    default:
      return badge.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
};

const getBadgeDescription = (badge: string) => {
  switch (badge) {
    case 'new_user':
      return 'Successfully registered on BookLendiverse';
    case 'bronze_lender':
      return 'Completed 5 transactions';
    case 'silver_lender':
      return 'Completed 15 transactions';
    case 'gold_lender':
      return 'Completed 30 transactions';
    case 'platinum_lender':
      return 'Completed 50 transactions';
    case 'trusted_user':
      return 'Consistently received positive reviews';
    case 'book_enthusiast':
      return 'Listed more than 10 books';
    case 'book_worm':
      return 'Borrowed more than 20 books';
    case 'book_collector':
      return 'Has a diverse collection of book genres';
    default:
      return 'Special achievement';
  }
};

const BadgesDisplay = ({ badges, transactionCount }: BadgeDisplayProps) => {
  // If no badges, show empty state
  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground text-sm">No badges earned yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <span className="font-medium">Transaction Count: {transactionCount}</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <TooltipProvider>
          {badges.map((badge, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="flex items-center gap-1 py-1 px-2 cursor-help">
                  {getBadgeIcon(badge)}
                  <span>{getBadgeTitle(badge)}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getBadgeDescription(badge)}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
      
      <div className="mt-2">
        <h4 className="text-sm font-medium mb-1">Next Milestone</h4>
        {transactionCount < 5 ? (
          <p className="text-xs text-muted-foreground">Complete {5 - transactionCount} more transactions to earn Bronze Lender badge</p>
        ) : transactionCount < 15 ? (
          <p className="text-xs text-muted-foreground">Complete {15 - transactionCount} more transactions to earn Silver Lender badge</p>
        ) : transactionCount < 30 ? (
          <p className="text-xs text-muted-foreground">Complete {30 - transactionCount} more transactions to earn Gold Lender badge</p>
        ) : transactionCount < 50 ? (
          <p className="text-xs text-muted-foreground">Complete {50 - transactionCount} more transactions to earn Platinum Lender badge</p>
        ) : (
          <p className="text-xs text-muted-foreground">You've reached the highest transaction milestone! Keep up the great work!</p>
        )}
      </div>
    </div>
  );
};

export default BadgesDisplay; 