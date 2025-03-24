import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Book, Check, Copy, Download, Loader2, MapPin, Receipt, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import html2canvas from "html2canvas";

interface TransactionDetails {
  _id: string;
  book: {
    _id: string;
    title: string;
    author: string;
    coverImage?: string;
    transactionType: "rent" | "buy";
    price: number;
    location?: {
      city?: string;
      state?: string;
    };
  };
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  buyer: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  transactionType: "rent" | "buy";
  paymentId: string;
  ticketId: string;
  status: "pending" | "completed" | "failed";
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

const TransactionTicket = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        if (!ticketId) return;

        const response = await fetch(`/api/payments/ticket/${ticketId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch transaction details");
        }

        const data = await response.json();
        setTransaction(data);
      } catch (error) {
        console.error("Error fetching transaction details:", error);
        toast({
          title: "Error",
          description: "Failed to load transaction details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [ticketId, toast]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCopyTicketId = async () => {
    if (!transaction) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(transaction.ticketId);
      toast({
        title: "Copied!",
        description: "Ticket ID copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy ticket ID",
        variant: "destructive",
      });
    } finally {
      setCopying(false);
    }
  };

  const handleDownloadTicket = async () => {
    if (!transaction) return;
    setDownloading(true);
    
    try {
      const ticketElement = document.getElementById('ticket-card');
      if (!ticketElement) {
        throw new Error("Ticket element not found");
      }
      
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Ticket-${transaction.ticketId.slice(-8)}.png`;
      link.click();
      
      toast({
        title: "Success",
        description: "Ticket downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading ticket:", error);
      toast({
        title: "Error",
        description: "Failed to download ticket",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
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
      <div className="container max-w-xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container max-w-xl mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Transaction Not Found</h2>
          <p className="text-muted-foreground mb-6">The transaction ticket you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Transactions
        </Button>
      </div>
      
      <Card id="ticket-card" className="border-2">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Transaction Ticket
              </CardTitle>
              <CardDescription className="mt-1">
                #{transaction.ticketId.slice(-8)}
              </CardDescription>
            </div>
            <div>
              {getStatusBadge(transaction.status)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1">
              <div className="aspect-[2/3] bg-muted rounded-md overflow-hidden flex items-center justify-center mb-4">
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
                  <Book className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
            </div>
            
            <div className="col-span-2">
              <h3 className="font-semibold text-xl">{transaction.book.title}</h3>
              <p className="text-muted-foreground">{transaction.book.author}</p>
              
              {transaction.book.location && (transaction.book.location.city || transaction.book.location.state) && (
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>
                    {[
                      transaction.book.location.city,
                      transaction.book.location.state
                    ].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Transaction Type</h4>
                  <p className="font-medium capitalize">{transaction.transactionType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Amount</h4>
                  <p className="font-medium">
                    ₹{transaction.amount}
                    {transaction.transactionType === "rent" ? "/day" : ""}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Purchase Date</h4>
                  <p>{formatDate(new Date(transaction.createdAt))}</p>
                </div>
                {transaction.transactionType === "rent" && transaction.startDate && transaction.endDate && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Rental Period</h4>
                    <p>{formatDate(new Date(transaction.startDate))} - {formatDate(new Date(transaction.endDate))}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                <User className="h-4 w-4" />
                Buyer Information
              </h4>
              <p className="font-medium">{transaction.buyer.name}</p>
              <p className="text-sm text-muted-foreground">{transaction.buyer.email}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                <User className="h-4 w-4" />
                Seller Information
              </h4>
              <p className="font-medium">{transaction.seller.name}</p>
              <p className="text-sm text-muted-foreground">{transaction.seller.email}</p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="bg-muted/50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Payment Details</h4>
              {transaction.status === "completed" && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm mb-1">
              <span className="text-muted-foreground">Transaction ID:</span> {transaction.paymentId}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Payment Method:</span> Razorpay
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-4">
          <div className="flex items-center">
            <p className="text-xs text-muted-foreground">Ticket ID: {transaction.ticketId}</p>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyTicketId} disabled={copying}>
              {copying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadTicket} disabled={downloading}>
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download Ticket
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TransactionTicket; 