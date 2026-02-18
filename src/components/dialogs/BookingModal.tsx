import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2, Phone, CheckCircle2 } from "lucide-react";
import { Equipment } from "@/data/mockData";
import { createBooking } from "@/services/bookingsService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = 'http://localhost/agriAPIs';

interface BookingModalProps {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BookingModal({ equipment, open, onOpenChange, onSuccess }: BookingModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  if (!equipment) return null;

  const today = new Date().toISOString().split("T")[0];

  const getDays = () => {
    if (!startDate || !endDate || endDate <= startDate) return 0;
    return Math.ceil((new Date(endDate + 'T00:00:00Z').getTime() - new Date(startDate + 'T00:00:00Z').getTime()) / (1000 * 60 * 60 * 24));
  };

  const totalCost = getDays() * equipment.pricePerDay;

  const handlePay = async () => {
    setError(null);
    if (!startDate || !endDate) { setError("Please select both start and end dates"); return; }
    if (endDate <= startDate) { setError("End date must be after start date"); return; }
    if (startDate < today) { setError("Start date cannot be in the past"); return; }
    if (!phoneNumber || phoneNumber.length < 10) { setError("Please enter a valid phone number (e.g. 078XXXXXXX)"); return; }

    try {
      setIsPaying(true);
      const response = await fetch(`${API_BASE_URL}/paymentAPI.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalCost,
          number: phoneNumber,
        }),
      });
      const data = await response.json();

      if (data?.status === 'success' || data?.transactions) {
        setPaymentDone(true);
        toast({ title: "Payment initiated!", description: "Check your phone to confirm the payment." });
      } else {
        setError(data?.message || "Payment failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Payment request failed. Check your connection.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleConfirmBooking = async () => {
    setError(null);
    const days = getDays();

    try {
      setIsLoading(true);
      const response = await createBooking({
        equipmentId: parseInt(equipment.id),
        customerId: parseInt(user?.id || "0"),
        customerName: user?.name || user?.email || 'Guest',
        customerPhone: phoneNumber || (user as any)?.phone || 'N/A',
        customerEmail: user?.email || '',
        startDate,
        endDate,
        totalDays: days,
        totalPrice: totalCost,
        status: 'confirmed',
      });

      if (response.status === "success") {
        toast({ title: "Booking Confirmed!", description: `Equipment booked for ${days} day${days > 1 ? "s" : ""}. Total: $${totalCost.toFixed(2)}` });
        setStartDate(""); setEndDate(""); setPhoneNumber(""); setError(null); setPaymentDone(false);
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError(response.message || "Failed to create booking");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while booking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setPaymentDone(false);
      setError(null);
      setPhoneNumber("");
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Equipment</DialogTitle>
          <DialogDescription>{equipment.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Daily Rate:</span>
              <span className="font-semibold">${equipment.pricePerDay}/day</span>
            </div>
            {getDays() > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <span className="font-semibold">{getDays()} day(s)</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-sm font-medium">Total to Pay:</span>
                  <span className="font-bold text-primary">${totalCost.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}

          {paymentDone && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 flex gap-2 text-primary text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>Payment successful! Click "Confirm Booking" to finalize.</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input id="start-date" type="date" min={today} value={startDate} disabled={paymentDone} onChange={(e) => {
              setStartDate(e.target.value);
              if (!endDate && e.target.value) {
                const nextDay = new Date(e.target.value);
                nextDay.setDate(nextDay.getDate() + 1);
                setEndDate(nextDay.toISOString().split("T")[0]);
              }
            }} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input id="end-date" type="date" min={startDate || today} value={endDate} disabled={paymentDone} onChange={(e) => setEndDate(e.target.value)} className="h-10" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-number">Mobile Money Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone-number"
                type="tel"
                placeholder="078XXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={paymentDone}
                className="h-10 pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">MTN or Airtel mobile money number</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
          {!paymentDone ? (
            <Button onClick={handlePay} className="gradient-primary" disabled={isPaying || !startDate || !endDate || !phoneNumber}>
              {isPaying ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>) : `Pay $${totalCost > 0 ? totalCost.toFixed(2) : '0.00'}`}
            </Button>
          ) : (
            <Button onClick={handleConfirmBooking} className="gradient-primary" disabled={isLoading}>
              {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Confirming...</>) : "Confirm Booking"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
