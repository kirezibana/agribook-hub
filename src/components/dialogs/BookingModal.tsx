import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2, Calendar } from "lucide-react";
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

export function BookingModal({ equipment, open, onOpenChange, onSuccess }: BookingModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleBook = async () => {
    setError(null);
    if (!startDate || !endDate) { setError("Please select both start and end dates"); return; }
    if (endDate <= startDate) { setError("End date must be after start date"); return; }
    if (startDate < today) { setError("Start date cannot be in the past"); return; }

    try {
      setIsLoading(true);
      const response = await createBooking({
        equipmentId: parseInt(equipment.id),
        customerId: parseInt(user?.id || "0"),
        customerName: user?.name || user?.email || 'Guest',
        customerPhone: (user as any)?.phone || 'N/A',
        customerEmail: user?.email || '',
        startDate,
        endDate,
        totalDays: getDays(),
        totalPrice: totalCost,
        status: 'pending',
      });

      if (response.status === "success") {
        toast({ title: "Booking Submitted! 🎉", description: `Equipment booked for ${getDays()} day(s). Total: $${totalCost.toFixed(2)}` });
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
    setStartDate(""); setEndDate(""); setError(null);
  };

  const handleClose = (val: boolean) => {
    if (!val) resetForm();
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

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleBook} className="gradient-primary" disabled={isLoading || !startDate || !endDate || getDays() <= 0}>
            {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>) : (
              <><Calendar className="w-4 h-4 mr-2" />Book Now - ${totalCost > 0 ? totalCost.toFixed(2) : '0.00'}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
