import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, Loader2, Calendar, CreditCard, ArrowLeft, Phone, CheckCircle2 } from "lucide-react";
import { Equipment } from "@/data/mockData";
import { createBooking } from "@/services/bookingsService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Step = "details" | "payment";

export function BookingModal({ equipment, open, onOpenChange, onSuccess }: BookingModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("details");
  const [paymentNetwork, setPaymentNetwork] = useState<"mtn" | "airtel">("mtn");
  const [paymentPhone, setPaymentPhone] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const getDays = () => {
    if (!startDate || !endDate || !equipment || endDate <= startDate) return 0;
    return Math.ceil((new Date(endDate + 'T00:00:00Z').getTime() - new Date(startDate + 'T00:00:00Z').getTime()) / (1000 * 60 * 60 * 24));
  };

  const totalCost = equipment ? getDays() * equipment.pricePerDay : 0;

  if (!equipment) return null;

  const handleProceedToPayment = () => {
    setError(null);
    if (!startDate || !endDate) { setError("Please select both start and end dates"); return; }
    if (endDate <= startDate) { setError("End date must be after start date"); return; }
    if (startDate < today) { setError("Start date cannot be in the past"); return; }
    setStep("payment");
  };

  const handleBook = async () => {
    setError(null);
    if (!paymentPhone.trim()) { setError("Please enter your phone number"); return; }
    if (paymentPhone.trim().length < 10) { setError("Please enter a valid phone number"); return; }

    try {
      setIsLoading(true);
      const response = await createBooking({
        equipmentId: parseInt(equipment.id),
        customerId: parseInt(user?.id || "0"),
        customerName: user?.name || user?.email || 'Guest',
        customerPhone: paymentPhone.trim(),
        customerEmail: user?.email || '',
        startDate,
        endDate,
        totalDays: getDays(),
        totalPrice: totalCost,
        status: 'pending',
      });

      if (response.status === "success") {
        toast({ title: "Booking Submitted! 🎉", description: `Equipment booked for ${getDays()} day(s). Total: $${totalCost.toFixed(2)}. Payment via ${paymentNetwork.toUpperCase()}.` });
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
    setStartDate(""); setEndDate(""); setError(null); setStep("details"); setPaymentNetwork("mtn"); setPaymentPhone("");
  };

  const handleClose = (val: boolean) => {
    if (!val) resetForm();
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{step === "details" ? "Book Equipment" : "Payment"}</DialogTitle>
          <DialogDescription>{equipment.name}</DialogDescription>
        </DialogHeader>

        {/* Cost Summary */}
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
                <span className="text-sm font-medium">Total:</span>
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

        {step === "details" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" min={today} value={startDate} disabled={isLoading} onChange={(e) => {
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
              <Input id="end-date" type="date" min={startDate || today} value={endDate} disabled={isLoading} onChange={(e) => setEndDate(e.target.value)} className="h-10" />
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-5">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Payment Network</Label>
              <RadioGroup value={paymentNetwork} onValueChange={(v) => setPaymentNetwork(v as "mtn" | "airtel")} className="grid grid-cols-2 gap-3">
                <Label
                  htmlFor="mtn"
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                    paymentNetwork === "mtn" ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  <RadioGroupItem value="mtn" id="mtn" className="sr-only" />
                  <div className="w-12 h-12 rounded-full bg-[hsl(48,100%,50%)] flex items-center justify-center">
                    <span className="font-black text-xs text-[hsl(0,0%,0%)]">MTN</span>
                  </div>
                  <span className="font-semibold text-sm">MTN MoMo</span>
                  {paymentNetwork === "mtn" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </Label>
                <Label
                  htmlFor="airtel"
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                    paymentNetwork === "airtel" ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  <RadioGroupItem value="airtel" id="airtel" className="sr-only" />
                  <div className="w-12 h-12 rounded-full bg-[hsl(0,100%,40%)] flex items-center justify-center">
                    <span className="font-black text-xs text-white">Airtel</span>
                  </div>
                  <span className="font-semibold text-sm">Airtel Money</span>
                  {paymentNetwork === "airtel" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="payment-phone"
                  type="tel"
                  placeholder="07X XXX XXXX"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  disabled={isLoading}
                  className="h-10 pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">Enter the {paymentNetwork.toUpperCase()} number to be charged</p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === "details" && (
            <>
              <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
              <Button onClick={handleProceedToPayment} className="gradient-primary" disabled={!startDate || !endDate || getDays() <= 0}>
                <CreditCard className="w-4 h-4 mr-2" />Proceed to Payment
              </Button>
            </>
          )}
          {step === "payment" && (
            <>
              <Button variant="outline" onClick={() => { setStep("details"); setError(null); }} disabled={isLoading}>
                <ArrowLeft className="w-4 h-4 mr-2" />Back
              </Button>
              <Button onClick={handleBook} className="gradient-primary" disabled={isLoading || !paymentPhone.trim()}>
                {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>) : (
                  <><Calendar className="w-4 h-4 mr-2" />Pay & Book - ${totalCost > 0 ? totalCost.toFixed(2) : '0.00'}</>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
