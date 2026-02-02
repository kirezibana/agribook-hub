import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Calendar as CalendarIcon, Download, Filter, TrendingUp, DollarSign, Clock } from "lucide-react";
import { mockBookings, mockCategories, mockEquipment } from "@/data/mockData";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBookings = useMemo(() => {
    return mockBookings.filter((booking) => {
      const bookingDate = new Date(booking.startDate);
      const matchesDateRange = 
        (!dateRange.from || bookingDate >= dateRange.from) &&
        (!dateRange.to || bookingDate <= dateRange.to);
      const matchesCategory = categoryFilter === "all" || 
        mockEquipment.find(e => e.id === booking.equipmentId)?.categoryId === categoryFilter;
      const matchesEquipment = equipmentFilter === "all" || booking.equipmentId === equipmentFilter;
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      return matchesDateRange && matchesCategory && matchesEquipment && matchesStatus;
    });
  }, [dateRange, categoryFilter, equipmentFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalBookings = filteredBookings.length;
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    const totalDays = filteredBookings.reduce((sum, b) => sum + b.totalDays, 0);

    return { totalRevenue, totalBookings, avgBookingValue, totalDays };
  }, [filteredBookings]);

  const chartData = useMemo(() => {
    const byCategory: Record<string, { bookings: number; revenue: number }> = {};
    
    filteredBookings.forEach((booking) => {
      const cat = booking.categoryName;
      if (!byCategory[cat]) {
        byCategory[cat] = { bookings: 0, revenue: 0 };
      }
      byCategory[cat].bookings += 1;
      byCategory[cat].revenue += booking.totalPrice;
    });

    return Object.entries(byCategory).map(([name, data]) => ({
      name,
      bookings: data.bookings,
      revenue: data.revenue,
    }));
  }, [filteredBookings]);

  const revenueByMonth = useMemo(() => {
    const months: Record<string, number> = {};
    
    filteredBookings.forEach((booking) => {
      const month = booking.startDate.substring(0, 7);
      months[month] = (months[month] || 0) + booking.totalPrice;
    });

    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, revenue]) => ({
        month: format(new Date(month + "-01"), "MMM yyyy"),
        revenue,
      }));
  }, [filteredBookings]);

  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setCategoryFilter("all");
    setEquipmentFilter("all");
    setStatusFilter("all");
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-warning/10 text-warning",
      confirmed: "bg-primary/10 text-primary",
      completed: "bg-success/10 text-success",
      cancelled: "bg-destructive/10 text-destructive",
    };
    return <Badge className={`${styles[status]} border-0 capitalize`}>{status}</Badge>;
  };

  return (
    <AdminLayout title="Reports" subtitle="View booking reports and analytics">
      {/* Filters */}
      <Card className="border-0 shadow-lg mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Date Range Picker */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-64 justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      "Select date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {mockCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Equipment</Label>
              <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Equipment</SelectItem>
                  {mockEquipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
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

            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            <Button className="gradient-primary">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-success-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-warning-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Booking Value</p>
                <p className="text-2xl font-bold">${stats.avgBookingValue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-chart-4 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Rental Days</p>
                <p className="text-2xl font-bold">{stats.totalDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Bookings by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Booking Details ({filteredBookings.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">#{booking.id}</TableCell>
                  <TableCell>{booking.customerName}</TableCell>
                  <TableCell>{booking.equipmentName}</TableCell>
                  <TableCell>{booking.categoryName}</TableCell>
                  <TableCell className="text-sm">{booking.startDate} → {booking.endDate}</TableCell>
                  <TableCell>{booking.totalDays}</TableCell>
                  <TableCell className="font-bold text-primary">${booking.totalPrice}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No bookings match your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
