import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowUpDown, Calendar, CreditCard, Download, Loader2, Search, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
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

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ 
    key: 'createdAt', 
    direction: 'descending' 
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        setLoading(true);
        // In a real application, this would be an admin-protected endpoint
        const response = await fetch("/api/payments/admin/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await response.json();
        setTransactions(data);
        setFilteredTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast({
          title: "Error",
          description: "Failed to load transactions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllTransactions();
  }, [toast]);

  useEffect(() => {
    // Apply all filters and sorting
    let result = [...transactions];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (transaction) =>
          transaction.book.title.toLowerCase().includes(lowerSearchTerm) ||
          transaction.buyer.name.toLowerCase().includes(lowerSearchTerm) ||
          transaction.seller.name.toLowerCase().includes(lowerSearchTerm) ||
          transaction.ticketId.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((transaction) => transaction.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((transaction) => transaction.transactionType === typeFilter);
    }

    // Apply date range filter
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      result = result.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        return transactionDate >= fromDate;
      });
    }

    if (dateRange?.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      result = result.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        return transactionDate <= toDate;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Transaction];
      const bValue = b[sortConfig.key as keyof Transaction];
      
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'ascending' 
          ? (a.amount - b.amount) 
          : (b.amount - a.amount);
      }
      
      if (sortConfig.key === 'createdAt') {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return sortConfig.direction === 'ascending' 
          ? (aDate - bDate) 
          : (bDate - aDate);
      }
      
      // Default string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'ascending' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });

    setFilteredTransactions(result);
  }, [transactions, searchTerm, statusFilter, typeFilter, sortConfig, dateRange]);

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      // Create CSV content
      const headers = [
        "Transaction ID", 
        "Ticket ID", 
        "Book Title", 
        "Buyer", 
        "Seller", 
        "Amount", 
        "Type", 
        "Status", 
        "Date"
      ];
      
      const rows = filteredTransactions.map(t => [
        t._id,
        t.ticketId,
        t.book.title,
        t.buyer.name,
        t.seller.name,
        t.amount.toString(),
        t.transactionType,
        t.status,
        new Date(t.createdAt).toISOString()
      ]);
      
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transactions-export-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      
      toast({
        title: "Export successful",
        description: "Transaction data has been exported to CSV",
      });
    } catch (error) {
      console.error("Error exporting transactions:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the transaction data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewTransaction = (ticketId: string) => {
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
      <div className="container py-8">
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Transaction Management</CardTitle>
              <CardDescription>
                Manage and monitor all transactions in the system
              </CardDescription>
            </div>
            <Button 
              onClick={handleExportCSV} 
              variant="outline" 
              className="whitespace-nowrap"
              disabled={isExporting || filteredTransactions.length === 0}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="rent">Rentals</SelectItem>
                    <SelectItem value="buy">Purchases</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <DatePickerWithRange 
                date={dateRange} 
                setDate={setDateRange} 
                className="w-auto"
              />
            </div>
            
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No transactions found matching your criteria</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSort('book.title')}
                          className="flex items-center p-0 font-medium"
                        >
                          Book
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSort('buyer.name')}
                          className="flex items-center p-0 font-medium"
                        >
                          Buyer
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSort('seller.name')}
                          className="flex items-center p-0 font-medium"
                        >
                          Seller
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSort('amount')}
                          className="flex items-center p-0 font-medium"
                        >
                          Amount
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSort('createdAt')}
                          className="flex items-center p-0 font-medium"
                        >
                          Date
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell className="font-medium">{transaction.book.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {transaction.buyer.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {transaction.seller.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          ₹{transaction.amount}
                          {transaction.transactionType === "rent" ? "/day" : ""}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {transaction.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(new Date(transaction.createdAt))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTransaction(transaction.ticketId)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div>
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                Total Value: ₹
                {filteredTransactions.reduce((total, t) => total + t.amount, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTransactions; 