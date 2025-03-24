import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { ReceiptIcon, Book, Calendar, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Transaction {
  _id: string;
  book: {
    _id: string;
    title: string;
    coverImage?: string;
  };
  seller: {
    _id: string;
    name: string;
  };
  buyer: {
    _id: string;
    name: string;
  };
  amount: number;
  transactionType: "rent" | "buy";
  paymentId: string;
  ticketId: string;
  status: "pending" | "completed" | "failed";
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        const response = await fetch("/api/payments/history", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch transaction history");
        }

        const data = await response.json();
        setTransactions(data);
        setFilteredTransactions(data);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        toast({
          title: "Error",
          description: "Failed to load transaction history. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [toast]);

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    if (value === "all") {
      setFilteredTransactions(transactions);
    } else if (value === "purchases") {
      setFilteredTransactions(transactions.filter(t => t.transactionType === "buy"));
    } else if (value === "rentals") {
      setFilteredTransactions(transactions.filter(t => t.transactionType === "rent"));
    } else if (value === "selling") {
      // Assuming current user ID is in localStorage or context
      const userId = localStorage.getItem("userId");
      setFilteredTransactions(transactions.filter(t => t.seller._id === userId));
    } else if (value === "buying") {
      const userId = localStorage.getItem("userId");
      setFilteredTransactions(transactions.filter(t => t.buyer._id === userId));
    }
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/transactions/${ticketId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ReceiptIcon className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <CardDescription>View all your book transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full" onValueChange={handleFilterChange}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="rentals">Rentals</TabsTrigger>
            <TabsTrigger value="selling">Selling</TabsTrigger>
            <TabsTrigger value="buying">Buying</TabsTrigger>
          </TabsList>

          <TabsContent value={activeFilter} className="mt-0">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction._id} className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                    <div className="sm:w-1/4">
                      <div className="aspect-[2/3] bg-muted rounded-md overflow-hidden flex items-center justify-center">
                        {transaction.book.coverImage ? (
                          <img 
                            src={transaction.book.coverImage} 
                            alt={transaction.book.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => { 
                              (e.target as HTMLImageElement).src = '/placeholder-book.png'; 
                            }}
                          />
                        ) : (
                          <Book className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{transaction.book.title}</h3>
                          <div className="text-sm text-muted-foreground mt-1">
                            {transaction.transactionType === "rent" ? "Rented from " : "Purchased from "}
                            <span className="font-medium">{transaction.seller.name}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(transaction.status)}
                          <div className="mt-1 font-medium">
                            ₹{transaction.amount}
                            {transaction.transactionType === "rent" ? "/day" : ""}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm flex flex-wrap gap-x-4 gap-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Transaction: {formatDate(new Date(transaction.createdAt))}</span>
                        </div>
                        {transaction.transactionType === "rent" && transaction.startDate && transaction.endDate && (
                          <div>
                            <span className="text-muted-foreground">
                              {formatDate(new Date(transaction.startDate))} - {formatDate(new Date(transaction.endDate))}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewTicket(transaction.ticketId)}
                        >
                          View Ticket #{transaction.ticketId.slice(-8)}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory; 