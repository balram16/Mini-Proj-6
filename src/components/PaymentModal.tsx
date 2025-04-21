import { useState, useEffect, useRef } from 'react';
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
import { AlertCircle, CheckCircle, Clock, Shield, CreditCard, QrCode } from 'lucide-react';
import { ethers } from 'ethers';

type PaymentMethod = 'metamask' | 'upi';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle: string;
  transactionType: 'rent' | 'buy';
  price: number; // Price in INR
  sellerName: string;
  sellerWalletAddress?: string;
  depositFee?: number; // Now calculated as price × 10 for rent
  sellerUpiId?: string; // UPI ID from owner's profile
}

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

const PaymentModal = ({
  isOpen,
  onClose,
  bookId,
  bookTitle,
  transactionType,
  price, // Now in INR
  sellerName,
  sellerWalletAddress = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
  depositFee = price * 10, // Default deposit is 10 times the daily rent
  sellerUpiId = "demouser123@ybl" // Default UPI ID if not provided
}: PaymentModalProps) => {
  // Console log the props for debugging
  console.log("PaymentModal props received:", { 
    isOpen, bookId, bookTitle, transactionType, price, 
    sellerName, sellerWalletAddress, depositFee, sellerUpiId 
  });
  
  // Add clear error message if UPI ID is missing
  if (!sellerUpiId || sellerUpiId === "demouser123@ybl") {
    console.warn("⚠️ WARNING: Using default UPI ID. Actual seller UPI ID was not provided:", sellerUpiId);
  } else {
    console.log("✅ Using actual seller UPI ID:", sellerUpiId);
  }

  // Ensure we have a valid UPI ID, defaulting if necessary
  const validUpiId = sellerUpiId || "demouser123@ybl";
  console.log("Using UPI ID:", validUpiId);

  const [duration, setDuration] = useState(1);
  const [totalAmount, setTotalAmount] = useState(price); // In INR
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi'); // Default to UPI
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const { user } = useUser();
  
  // UPI QR code generation
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  // ETH to INR conversion rate
  const ETH_TO_INR_RATE = 180000; // 1 ETH = ₹180,000
  
  // Calculate total amount
  useEffect(() => {
    if (transactionType === 'rent') {
      // For rent: deposit (10x daily rent) + first day rent
      setTotalAmount(depositFee + price);
    } else {
      // For buy: just the price
      setTotalAmount(price);
    }
  }, [price, depositFee, transactionType]);
  
  // Convert INR to ETH - ensuring prices are treated as INR already
  const inrToEth = (inrAmount: number): number => {
    console.log(`Converting ₹${inrAmount} INR to ETH at rate 1 ETH = ₹${ETH_TO_INR_RATE}`);
    return inrAmount / ETH_TO_INR_RATE;
  };
  
  // Generate UPI QR code URL
  useEffect(() => {
    if (paymentMethod === 'upi' && validUpiId) {
      try {
        // Create UPI payment URL with required parameters
        const upiUrl = `upi://pay?pa=${encodeURIComponent(validUpiId)}&pn=${encodeURIComponent(sellerName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`${transactionType === 'rent' ? 'Rental' : 'Purchase'} of ${bookTitle}`)}`;
        
        // Generate QR code using a public API
        const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
        
        setQrCodeUrl(qrCodeApiUrl);
        console.log("Generated QR code for UPI payment:", qrCodeApiUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
        toast.error("Could not generate QR code for UPI payment");
      }
    }
  }, [paymentMethod, validUpiId, totalAmount, sellerName, bookTitle, transactionType]);
  
  // Function to connect to MetaMask
  const connectWallet = async (): Promise<string> => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install it.');
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        return accounts[0];
      } else {
        throw new Error('No accounts found in MetaMask.');
      }
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      const message = error.message?.includes('User rejected')
        ? 'Connection request rejected by user.'
        : 'Could not connect to MetaMask.';
      throw new Error(message);
    }
  };

  // Handle MetaMask payment
  const handleMetaMaskPayment = async () => {
    if (!user) {
      toast.error('Please login to continue');
      return;
    }
    
    setIsProcessing(true);
    try {
      // Connect to wallet
      const userWalletAddress = await connectWallet();
      console.log('Connected user wallet address:', userWalletAddress);

      // Convert INR to ETH for the transaction - price is already in INR
      const ethAmount = inrToEth(totalAmount);
      
      console.log(`Payment details: ₹${totalAmount.toFixed(2)} INR = ${ethAmount.toFixed(8)} ETH`);
      
      // Prepare transaction
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = {
        to: sellerWalletAddress,
        value: ethers.parseEther(ethAmount.toFixed(8)), // Convert to ETH with 8 decimal precision
      };

      console.log(`Attempting to send ${ethAmount.toFixed(8)} ETH (₹${totalAmount.toFixed(2)}) to ${sellerWalletAddress}`);

      // Send transaction
      const txResponse = await signer.sendTransaction(tx);
      console.log('Transaction submitted:', txResponse.hash);
      toast.loading('Processing transaction...', { id: 'txn-toast' });

      // Wait for confirmation
      const receipt = await txResponse.wait();
      toast.dismiss('txn-toast');

      // Check receipt
      if (!receipt || !receipt.hash) {
        throw new Error('Transaction failed or receipt was not found.');
      }

      // Update UI
      setTransactionHash(receipt.hash);
      setPaymentSuccess(true);
      toast.success('Payment successful!');

      // Store transaction details in database (simulated)
      // In a real app, this would make a backend API call
      console.log('Transaction details:', {
        bookId,
        transactionType,
        amount: totalAmount,
        ethAmount,
        paymentMethod: 'metamask',
        depositAmount: transactionType === 'rent' ? depositFee : 0,
        rentDuration: transactionType === 'rent' ? duration : 0,
        txHash: receipt.hash
      });

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.dismiss('txn-toast');
      
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction rejected by user.');
      } else if (error.message?.includes('MetaMask is not installed')) {
        toast.error(error.message);
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        toast.error('Insufficient funds for transaction.');
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle direct UPI payment confirmation
  const handleConfirmDirectPayment = () => {
    if (!user) {
      toast.error('Please login to continue');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate verification (in a real app, you would verify with your backend)
    setTimeout(() => {
      const randomTxId = `UPI-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setTransactionHash(randomTxId);
      setPaymentSuccess(true);
      setIsProcessing(false);
      toast.success('Payment confirmed. Thank you!');
      
      // Store transaction details in database (simulated)
      console.log('Transaction details:', {
        bookId,
        transactionType,
        amount: totalAmount,
        paymentMethod: 'upi',
        depositAmount: transactionType === 'rent' ? depositFee : 0,
        rentDuration: transactionType === 'rent' ? duration : 0,
        txHash: randomTxId
      });
    }, 1500);
  };

  // Handle payment based on method
  const handlePayment = () => {
    if (paymentMethod === 'metamask') {
      handleMetaMaskPayment();
    } else if (paymentConfirmed) {
      handleConfirmDirectPayment();
    }
  };

  const handleCloseCompleted = () => {
    setPaymentSuccess(false);
    setTransactionHash('');
    onClose();
  };

  // Add an effect to show a toast when the modal is displayed
  useEffect(() => {
    if (isOpen) {
      console.log('PaymentModal is open and component has mounted');
      // Add a direct toast message to confirm modal is open
      toast.success('Payment options loaded');
    }
  }, [isOpen]);

  return (
    <>
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
              <h3 className="font-semibold text-lg mb-2 text-green-800">Transaction Details</h3>
<div className="space-y-2">
  <div className="flex justify-between">
    <span className="text-sm text-gray-700">Book:</span>
    <span className="font-medium text-gray-900">{bookTitle}</span>
  </div>
  <div className="flex justify-between">
    <span className="text-sm text-gray-700">Amount:</span>
    <span className="font-medium text-gray-900">
      {paymentMethod === 'metamask' 
        ? `₹${totalAmount.toFixed(2)} (${inrToEth(totalAmount).toFixed(8)} ETH)` 
        : `₹${totalAmount.toFixed(2)}`}
    </span>
  </div>
  <div className="flex justify-between">
    <span className="text-sm text-gray-700">Transaction Type:</span>
    <span className="font-medium text-gray-900 capitalize">{transactionType}</span>
  </div>
  {transactionType === 'rent' && (
    <>
      <div className="flex justify-between">
        <span className="text-sm text-gray-700">Deposit Amount:</span>
        <span className="font-medium text-gray-900">₹{depositFee.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-700">First Day Rent:</span>
        <span className="font-medium text-gray-900">₹{price.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-700">Return Policy:</span>
        <span className="font-medium text-gray-900">Deposit will be refunded upon return</span>
      </div>
    </>
  )}
  <div className="flex justify-between">
    <span className="text-sm text-gray-700">Reference ID:</span>
    <span className="font-medium truncate text-xs text-gray-900" title={transactionHash}>
      {transactionHash || 'N/A'}
    </span>
  </div>
  <div className="flex justify-between">
    <span className="text-sm text-gray-700">Payment Method:</span>
    <span className="font-medium text-gray-900 capitalize">
      {paymentMethod === 'metamask' ? 'MetaMask' : 'UPI'}
    </span>
  </div>
</div>

              </div>
              
              <p className="text-sm text-muted-foreground mt-2">
                {paymentMethod === 'metamask' 
                  ? 'Your transaction has been confirmed on the blockchain.' 
                  : 'Your payment has been processed successfully. Enjoy your book!'}
                
                {transactionType === 'rent' && (
                  <span className="block mt-2 font-medium">
                    Remember to return the book to get your deposit refunded.
                  </span>
                )}
              </p>
              
              <DialogFooter>
                <Button onClick={handleCloseCompleted}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Complete Your Payment</DialogTitle>
                <DialogDescription>
                  {transactionType === 'rent'
                    ? 'Pay deposit and first day rent'
                    : 'Complete your purchase'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {/* Payment Method Selection */}
                <div className="space-y-2">
                  <Label>Select Payment Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      type="button" 
                      variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                      className="flex justify-center items-center gap-2"
                      onClick={() => {
                        setPaymentMethod('upi');
                        setPaymentConfirmed(false);
                        // Log UPI ID when selecting UPI payment method
                        console.log("Selected UPI payment, seller's UPI ID:", validUpiId);
                      }}
                    >
                      <QrCode className="h-4 w-4" />
                      <span className="text-xs md:text-sm">UPI</span>
                    </Button>
                    <Button 
                      type="button" 
                      variant={paymentMethod === 'metamask' ? 'default' : 'outline'}
                      className="flex justify-center items-center gap-2"
                      onClick={() => {
                        setPaymentMethod('metamask');
                        setPaymentConfirmed(false);
                      }}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.4 4.5L12 7.1L13.5 5.4L19.4 4.5Z" fill="currentColor" />
                        <path d="M4.6 4.5L11.9 7.2L10.5 5.4L4.6 4.5Z" fill="currentColor" />
                        <path d="M18.2 15.2L16.5 18.2L20 19.3L21 15.3L18.2 15.2Z" fill="currentColor" />
                        <path d="M3 15.3L4 19.3L7.5 18.2L5.8 15.2L3 15.3Z" fill="currentColor" />
                        <path d="M7.3 10.5L6.1 12.4L9.6 12.5L9.5 8.7L7.3 10.5Z" fill="currentColor" />
                        <path d="M16.7 10.5L14.5 8.6L14.5 12.5L18 12.4L16.7 10.5Z" fill="currentColor" />
                        <path d="M7.5 18.2L9.4 17L7.8 15.3L7.5 18.2Z" fill="currentColor" />
                        <path d="M14.6 17L16.5 18.2L16.2 15.3L14.6 17Z" fill="currentColor" />
                      </svg>
                      <span className="text-xs md:text-sm">MetaMask</span>
                    </Button>
                  </div>
                </div>
              
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
                    {transactionType === 'rent' && (
                       <>
                        <div className="flex justify-between">
                          <span>Rent (1 day):</span>
                          <span className="font-medium">
                            ₹{price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deposit (10x daily rent):</span>
                          <span className="font-medium">
                            ₹{depositFee.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground italic">
                          <span>Note:</span>
                          <span>Deposit refunded upon return</span>
                        </div>
                       </>
                    )}
                    {transactionType === 'buy' && (
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-medium">
                          ₹{price.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {paymentMethod === 'metamask' && (
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>ETH Equivalent:</span>
                        <span>{inrToEth(totalAmount).toFixed(8)} ETH</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {transactionType === 'rent' && (
                  <div className="space-y-2">
                    <Label htmlFor="duration">Intended Rental Duration (days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={1}
                      value={duration}
                      onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <p className="text-xs text-muted-foreground">Note: Initial payment covers deposit + 1 day rent. Additional days will be charged upon return.</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-lg font-bold">
                    ₹{totalAmount.toFixed(2)}
                    {paymentMethod === 'metamask' && (
                      <span className="block text-xs text-muted-foreground text-right">
                        {inrToEth(totalAmount).toFixed(8)} ETH
                      </span>
                    )}
                  </span>
                </div>
                
                {/* Seller's UPI ID information */}
                {paymentMethod === 'upi' && validUpiId && (
                  <div className="p-3 bg-orange-50 border border-orange-100 rounded-md space-y-4">
                    <h3 className="font-medium text-orange-700 flex items-center gap-1">
                      <span>Seller's UPI ID</span>
                      <span className="text-xs bg-orange-100 px-2 py-0.5 rounded">Direct Payment</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <code className="bg-white px-2 py-1 rounded border flex-1">{validUpiId}</code>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(validUpiId);
                          toast.success('UPI ID copied to clipboard');
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    
                    {/* QR Code Section */}
                    {qrCodeUrl && (
                      <div className="flex flex-col items-center mt-4">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <QrCode className="h-4 w-4" />
                          Scan QR Code to Pay
                        </h4>
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <img 
                            src={qrCodeUrl} 
                            alt="UPI Payment QR Code"
                            className="w-48 h-48 object-contain"
                          />
                        </div>
                        <p className="text-xs text-center mt-2 text-muted-foreground">
                          Scan with any UPI app to pay ₹{totalAmount.toFixed(2)}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      Please pay ₹{totalAmount.toFixed(2)} using this UPI ID through your preferred UPI app or by scanning the QR code.
                    </p>
                    <div className="mt-2">
                      <Label className="text-sm">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          checked={paymentConfirmed} 
                          onChange={(e) => setPaymentConfirmed(e.target.checked)}
                        />
                        I've completed the UPI payment
                      </Label>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>
                    {paymentMethod === 'metamask' 
                      ? 'Secure payment via MetaMask' 
                      : 'Direct UPI payment to seller - scan QR code or copy UPI ID'}
                  </span>
                </div>
                
                {paymentMethod === 'metamask' && (
                  <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                    Note: INR amount will be converted to ETH at the current exchange rate (₹{ETH_TO_INR_RATE} = 1 ETH)
                  </div>
                )}
                
                {transactionType === 'rent' && (
                  <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
                    <p className="font-medium">Deposit Policy:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>Deposit amount: 10× daily rent (₹{depositFee.toFixed(2)})</li>
                      <li>Refundable upon book return in good condition</li>
                      <li>Extended rental will be charged from deposit</li>
                    </ul>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                  Cancel
                </Button>
                {/* Only show the Pay button for MetaMask or direct UPI confirmation */}
                {(paymentMethod === 'metamask' || (paymentMethod === 'upi' && paymentConfirmed)) && (
                  <Button 
                    onClick={handlePayment} 
                    disabled={isProcessing || (paymentMethod === 'metamask' && !sellerWalletAddress)}
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      paymentMethod === 'metamask' ? 'Pay with MetaMask' : 'Confirm UPI Payment'
                    )}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentModal; 