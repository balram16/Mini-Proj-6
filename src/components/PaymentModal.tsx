import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from '@/lib/contexts/UserContext';
import { toast } from 'react-hot-toast';
import { AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle: string;
  transactionType: 'rent' | 'buy';
  price: number;
  sellerName: string;
  sellerUpiId?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentModal = ({
  isOpen,
  onClose,
  bookId,
  bookTitle,
  transactionType,
  price,
  sellerName,
  sellerUpiId
}: PaymentModalProps) => {
  const [duration, setDuration] = useState(7); // Default 7 days for rent
  const [totalAmount, setTotalAmount] = useState(price);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const { user } = useUser();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  // Calculate total amount when duration changes (for rent)
  useEffect(() => {
    if (transactionType === 'rent') {
      setTotalAmount(price * duration);
    } else {
      setTotalAmount(price);
    }
  }, [price, duration, transactionType]);

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to continue');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Create order via backend
      const response = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('booklendiverse_token') || '',
        },
        body: JSON.stringify({
          bookId,
          duration: transactionType === 'rent' ? duration : undefined,
        }),
      });
      
      const orderData = await response.json();
      
      if (!response.ok) {
        throw new Error(orderData.message || 'Could not create payment order');
      }
      
      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount * 100, // in paise
        currency: orderData.currency,
        name: "BookLendiverse",
        description: `Payment for ${transactionType === 'rent' ? 'renting' : 'buying'} ${bookTitle}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment with backend
            const verifyResponse = await fetch('http://localhost:5000/api/payments/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('booklendiverse_token') || '',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                transactionId: orderData.transactionId,
              }),
            });
            
            const verifyData = await verifyResponse.json();
            
            if (!verifyResponse.ok) {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
            
            // Show success state
            setTicketId(verifyData.ticketId);
            setPaymentSuccess(true);
            toast.success('Payment successful!');
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        notes: {
          seller_upi: sellerUpiId || '',
          address: "BookLendiverse Headquarters",
        },
        theme: {
          color: "#3730a3",
        },
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCloseCompleted = () => {
    setPaymentSuccess(false);
    setTicketId('');
    onClose();
    window.location.href = '/dashboard?tab=rental-history'; // Redirect to transaction history
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {paymentSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Payment Successful!
              </DialogTitle>
              <DialogDescription>
                Your payment has been processed successfully
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-4 bg-green-50 border border-green-100 rounded-md mt-4">
              <h3 className="font-semibold text-lg mb-2">Transaction Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Book:</span>
                  <span className="font-medium">{bookTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transaction Type:</span>
                  <span className="font-medium capitalize">{transactionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ticket ID:</span>
                  <span className="font-medium">{ticketId}</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-2">
              This ticket ID serves as proof of your transaction. Keep it safe for future reference.
            </p>
            
            <DialogFooter>
              <Button onClick={handleCloseCompleted}>
                View Transaction History
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Complete Your Payment</DialogTitle>
              <DialogDescription>
                {transactionType === 'rent' 
                  ? 'Specify rental duration and complete payment' 
                  : 'Review and complete your purchase'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
                <h3 className="font-medium text-blue-700">Payment Summary</h3>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Book:</span>
                    <span className="font-medium">{bookTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seller:</span>
                    <span className="font-medium">{sellerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium">
                      ₹{price.toFixed(2)} {transactionType === 'rent' ? '/ day' : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              {transactionType === 'rent' && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Rental Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="font-medium">Total Amount:</span>
                <span className="text-lg font-bold">₹{totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure payment powered by Razorpay</span>
              </div>
              
              {sellerUpiId && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Payment to UPI:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">{sellerUpiId}</code>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay Now'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal; 