import { useState, useEffect } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getBookings, deleteBooking } from "@/services/bookingsService";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getBookings({
        customerId: parseInt(user?.id || "0"),
      });

      setBookings(data);
    } catch (err) {
      setError("Failed to load your bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId: string) => {
    try {
      setDeleting(bookingId);
      await deleteBooking(bookingId);
      await fetchBookings();
      toast({
        title: "Cancelled",
        description: "Your booking has been cancelled",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-warning/10 text-warning",
      confirmed: "bg-primary/10 text-primary",
      completed: "bg-success/10 text-success",
      cancelled: "bg-destructive/10 text-destructive",
    };
    return (
      <Badge className={`${styles[status] || "bg-muted/10"} border-0 capitalize`}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <CustomerLayout
        title="My Bookings"
        subtitle="View and manage your equipment bookings"
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout
        title="My Bookings"
        subtitle="View and manage your equipment bookings"
      >
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold">Failed to load bookings</p>
                <p className="text-sm">{error}</p>
              </div>
              <Button
                variant="outline"
                onClick={fetchBookings}
                size="sm"
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout
      title="My Bookings"
      subtitle="View and manage your equipment bookings"
    >
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            All Bookings ({bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-muted/50">
                    <TableCell>
                      <p className="font-semibold">{booking.equipmentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.equipment}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(booking.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(booking.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {Math.ceil(
                        (new Date(booking.endDate).getTime() -
                          new Date(booking.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      day(s)
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-primary">
                        ${booking.totalCost?.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-right">
                      {booking.status === "pending" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              disabled={deleting === booking.id}
                            >
                              {deleting === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this booking? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(booking.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Cancel Booking
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by browsing available equipment and making your first booking
              </p>
              <Button
                onClick={() => window.location.href = "/home"}
                className="gradient-primary"
              >
                Browse Equipment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </CustomerLayout>
  );
}
