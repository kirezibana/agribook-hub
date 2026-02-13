import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react";
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

  if (!equipment) return null;

  const today = new Date().toISOString().split("T")[0];

  const handleBook = async () => {
    setError(null);
    if (!startDate || !endDate) { setError("Please select both start and end dates"); return; }
    if (endDate <= startDate) { setError("End date must be after start date"); return; }
    if (startDate < today) { setError("Start date cannot be in the past"); return; }

    try {
      setIsLoading(true);
      const startUtc = new Date(startDate + 'T00:00:00Z');
      const endUtc = new Date(endDate + 'T00:00:00Z');
      const days = Math.ceil((endUtc.getTime() - startUtc.getTime()) / (1000 * 60 * 60 * 24));
      const totalCost = days * equipment.pricePerDay;

      const response = await createBooking({
        equipmentId: parseInt(equipment.id),
        customerId: parseInt(user?.id || "0"),
        customerName: user?.name || user?.email || 'Guest',
        customerPhone: (user as any)?.phone || 'N/A',
        customerEmail: user?.email || '',
        startDate,
        endDate,
        totalDays: days,
        totalPrice: totalCost,
        status: 'pending',
      });

      if (response.status === "success") {
        toast({ title: "Success!", description: `Equipment booked for ${days} day${days > 1 ? "s" : ""}. Total: $${totalCost.toFixed(2)}` });
        setStartDate(""); setEndDate(""); setError(null);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            {startDate && endDate && endDate > startDate && (() => {
              const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="font-semibold">{days} day(s)</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-sm font-medium">Estimated Total:</span>
                    <span className="font-bold text-primary">${(days * equipment.pricePerDay).toFixed(2)}</span>
                  </div>
                </>
              );
            })()}
          </div>
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input id="start-date" type="date" min={today} value={startDate} onChange={(e) => {
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
            <Input id="end-date" type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleBook} className="gradient-primary" disabled={isLoading || !startDate || !endDate}>
            {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Booking...</>) : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
