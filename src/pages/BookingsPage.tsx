import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarCheck, Search, Eye, Pencil, Trash2, Phone, Calendar, AlertCircle } from "lucide-react";
import { Booking } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { getBookings, updateBooking, deleteBooking } from "@/services/bookingsService";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState<Booking["status"]>("pending");
  const { toast } = useToast();

  // Load bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
      toast({ title: "Error", description: "Failed to load bookings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const customerName = (booking.customerName || '').toString();
    const equipmentName = (booking.equipmentName || '').toString();
    const matchesSearch =
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipmentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async () => {
    if (!editingBooking) return;
    
    try {
      setSaveLoading(true);
      await updateBooking(editingBooking.id, { status: editStatus } as any);
      
      setBookings(bookings.map((b) =>
        b.id === editingBooking.id ? { ...b, status: editStatus } : b
      ));
      setEditingBooking(null);
      toast({ title: "Success", description: "Booking status updated" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update booking", variant: "destructive" });
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBooking(id);
      await fetchBookings();
      toast({ title: "Deleted", description: "Booking removed successfully" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete booking", variant: "destructive" });
      console.error(err);
    }
  };

  const getStatusBadge = (status: Booking["status"]) => {
    const styles = {
      pending: "bg-warning/10 text-warning",
      confirmed: "bg-primary/10 text-primary",
      completed: "bg-success/10 text-success",
      cancelled: "bg-destructive/10 text-destructive",
    };
    return (
      <Badge className={`${styles[status]} border-0 capitalize`}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Bookings" subtitle="Manage customer equipment bookings">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Bookings" subtitle="Manage customer equipment bookings">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
              <Button variant="outline" onClick={fetchBookings} size="sm" className="ml-auto">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Bookings" subtitle="Manage customer equipment bookings">
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary" />
            All Bookings ({filteredBookings.length})
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-semibold">{booking.customerName}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {booking.customerPhone || 'N/A'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.equipmentName}</p>
                      <p className="text-sm text-muted-foreground">{booking.categoryName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{booking.startDate ? String(booking.startDate) : ''}</span>
                      <span>→</span>
                      <span>{booking.endDate ? String(booking.endDate) : ''}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{booking.totalDays ?? 0} days</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-primary">${booking.totalPrice !== undefined && booking.totalPrice !== null ? booking.totalPrice : '0.00'}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Dialog */}
                      <Dialog open={viewingBooking?.id === booking.id} onOpenChange={(open) => !open && setViewingBooking(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setViewingBooking(booking)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                            <DialogDescription>Booking ID: #{booking.id}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Customer Name</Label>
                                <p className="font-semibold">{booking.customerName || ''}</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Phone</Label>
                                <p className="font-semibold">{booking.customerPhone || 'N/A'}</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Equipment</Label>
                                <p className="font-semibold">{booking.equipmentName || ''}</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Category</Label>
                                <p className="font-semibold">{booking.categoryName || ''}</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Start Date</Label>
                                <p className="font-semibold">{booking.startDate ? String(booking.startDate) : ''}</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">End Date</Label>
                                <p className="font-semibold">{booking.endDate ? String(booking.endDate) : ''}</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Duration</Label>
                                <p className="font-semibold">{typeof booking.totalDays === 'number' ? booking.totalDays : (booking.totalDays ? Number(booking.totalDays) : 0)} days</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Total Price</Label>
                                <p className="font-semibold text-primary">${booking.totalPrice !== undefined && booking.totalPrice !== null ? booking.totalPrice : '0.00'}</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Status</Label>
                                {getStatusBadge(booking.status)}
                              </div>
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Created</Label>
                                <p className="font-semibold">{booking.createdAt ? String(booking.createdAt) : ''}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Edit Dialog */}
                      <Dialog 
                        open={editingBooking?.id === booking.id} 
                        onOpenChange={(open) => {
                          if (!open) setEditingBooking(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setEditingBooking(booking);
                              setEditStatus(booking.status);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Booking Status</DialogTitle>
                            <DialogDescription>Change the status for booking #{booking.id}</DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Label>Status</Label>
                            <Select value={editStatus} onValueChange={(val: Booking["status"]) => setEditStatus(val)}>
                              <SelectTrigger className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingBooking(null)}>Cancel</Button>
                            <Button onClick={handleUpdateStatus} className="gradient-primary" disabled={saveLoading}>
                              {saveLoading ? "Updating..." : "Update Status"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Delete Dialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this booking? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(booking.id)} 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <CalendarCheck className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No bookings found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
