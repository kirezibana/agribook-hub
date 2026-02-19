import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
const POLL_INTERVAL = 3000;
const MAX_POLL_ATTEMPTS = 40; // ~2 minutes

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
  const [isPolling, setIsPolling] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transactionRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const pollPaymentStatus = useCallback((ref: string, attempt = 0) => {
    if (attempt >= MAX_POLL_ATTEMPTS) {
      stopPolling();
      setError("Payment verification timed out. Please check your phone and try again.");
      setIsPaying(false);
      return;
    }

    pollRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/checkPaymentStatus.php?ref=${encodeURIComponent(ref)}`);
        const data = await res.json();

        const status = (data.status || "").toUpperCase();
        if (status === "SUCCESSFUL") {
          stopPolling();
          setPaymentDone(true);
          setIsPaying(false);
          toast({ title: "Payment Successful! ✅", description: "Your payment has been confirmed. Finalizing booking..." });
          handleConfirmBookingAfterPayment();
        } else if (status === "FAILED") {
          stopPolling();
          setIsPaying(false);
          setError("Payment failed. Please try again.");
          toast({ title: "Payment Failed ❌", description: "Your mobile money payment was not successful.", variant: "destructive" });
        } else {
          // Still pending, keep polling
          pollPaymentStatus(ref, attempt + 1);
        }
      } catch {
        pollPaymentStatus(ref, attempt + 1);
      }
    }, POLL_INTERVAL);
  }, [stopPolling, toast]);

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

      // Paypack returns a ref in the response
      const ref = data?.ref || data?.data?.ref || data?.transactions?.ref;

      if (ref) {
        transactionRef.current = ref;
        setIsPolling(true);
        toast({ title: "Payment initiated! 📱", description: "Check your phone to confirm the payment. We're waiting for confirmation..." });
        pollPaymentStatus(ref);
      } else if (data?.status === 'success' || data?.transactions) {
        // Fallback if no ref but success
        setPaymentDone(true);
        setIsPaying(false);
        toast({ title: "Payment initiated!", description: "Check your phone to confirm the payment." });
      } else {
        setIsPaying(false);
        setError(data?.message || "Payment failed. Please try again.");
      }
    } catch (err: any) {
      setIsPaying(false);
      setError(err.message || "Payment request failed. Check your connection.");
    }
  };

  const handleConfirmBookingAfterPayment = async () => {
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
        toast({ title: "Booking Confirmed! 🎉", description: `Equipment booked for ${days} day${days > 1 ? "s" : ""}. Total: $${totalCost.toFixed(2)}` });
        resetForm();
        onOpenChange(false);
        onSuccess?.();
        navigate('/my-bookings');
      } else {
        setError(response.message || "Failed to create booking");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while booking");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStartDate(""); setEndDate(""); setPhoneNumber(""); setError(null); setPaymentDone(false);
    transactionRef.current = null;
    stopPolling();
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      resetForm();
      setIsPaying(false);
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

          {isPolling && (
            <div className="bg-accent/50 border border-accent rounded-lg p-3 flex gap-2 text-accent-foreground text-sm">
              <Loader2 className="w-4 h-4 flex-shrink-0 mt-0.5 animate-spin" />
              <span>Waiting for payment confirmation from your phone... Please approve the transaction on your mobile.</span>
            </div>
          )}

          {paymentDone && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 flex gap-2 text-primary text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>Payment confirmed! Finalizing your booking...</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input id="start-date" type="date" min={today} value={startDate} disabled={paymentDone || isPaying} onChange={(e) => {
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
            <Input id="end-date" type="date" min={startDate || today} value={endDate} disabled={paymentDone || isPaying} onChange={(e) => setEndDate(e.target.value)} className="h-10" />
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
                disabled={paymentDone || isPaying}
                className="h-10 pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">MTN or Airtel mobile money number</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPolling}>Cancel</Button>
          {!paymentDone && (
            <Button onClick={handlePay} className="gradient-primary" disabled={isPaying || isPolling || !startDate || !endDate || !phoneNumber}>
              {isPaying || isPolling ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isPolling ? 'Waiting...' : 'Processing...'}</>) : `Pay $${totalCost > 0 ? totalCost.toFixed(2) : '0.00'}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
