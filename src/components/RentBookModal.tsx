import { useState } from 'react';
import { useUser } from '@/lib/contexts/UserContext';
import { BookType } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CreditCard, Calendar } from 'lucide-react';

interface RentBookModalProps {
  book: BookType;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RentBookModal = ({ book, isOpen, onClose, onSuccess }: RentBookModalProps) => {
  const { user } = useUser();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [rentalDuration, setRentalDuration] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = book.rentPrice * rentalDuration;
  const serviceFee = totalPrice * 0.1; // 10% service fee
  const securityDeposit = book.securityDeposit || 50;
  const total = totalPrice + serviceFee + securityDeposit;

  const handleRent = async () => {
    if (!selectedPaymentMethod) return;

    setIsProcessing(true);
    try {
      // TODO: Implement actual payment processing
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated API call
      onSuccess();
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rent "{book.title}"</DialogTitle>
          <DialogDescription>
            Complete your rental transaction securely
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rental Duration */}
          <div>
            <Label className="text-base font-medium">Rental Duration</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                type="number"
                min={1}
                max={12}
                value={rentalDuration}
                onChange={e => setRentalDuration(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-gray-500">weeks</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <Label className="text-base font-medium">Payment Method</Label>
            <RadioGroup
              value={selectedPaymentMethod}
              onValueChange={setSelectedPaymentMethod}
              className="mt-2 space-y-2"
            >
              {user?.paymentMethods.map(method => (
                <div
                  key={method.id}
                  className="flex items-center space-x-3 space-y-0 border rounded-lg p-4"
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {method.type === 'credit_card' ? 'Credit Card' : 'Debit Card'}
                        </p>
                        <p className="text-sm text-gray-500">
                          **** **** **** {method.last4}
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => {/* TODO: Implement add payment method */}}
            >
              Add New Payment Method
            </Button>
          </div>

          {/* Rental Summary */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Rental Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Rental Price (${book.rentPrice}/week × {rentalDuration} weeks)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit (refundable)</span>
                <span>${securityDeposit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-base pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Rental Terms */}
          <div className="text-sm text-gray-500 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Rental period starts from the day you receive the book</span>
            </div>
            <p>
              By clicking "Confirm Rental", you agree to our rental terms and conditions,
              including the security deposit and return policy.
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleRent}
            disabled={!selectedPaymentMethod || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Confirm Rental'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RentBookModal; 