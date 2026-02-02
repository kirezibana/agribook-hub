import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FolderOpen, 
  Wrench, 
  CalendarCheck, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { mockCategories, mockEquipment, mockBookings } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const stats = [
  {
    name: "Total Categories",
    value: mockCategories.length,
    icon: FolderOpen,
    color: "bg-primary",
    change: "+2 this month",
  },
  {
    name: "Total Equipment",
    value: mockEquipment.length,
    icon: Wrench,
    color: "bg-success",
    change: "+4 this month",
  },
  {
    name: "Active Bookings",
    value: mockBookings.filter(b => b.status === "confirmed" || b.status === "pending").length,
    icon: CalendarCheck,
    color: "bg-warning",
    change: "3 pending",
  },
  {
    name: "Total Revenue",
    value: `$${mockBookings.reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString()}`,
    icon: DollarSign,
    color: "bg-chart-4",
    change: "+12% vs last month",
  },
];

const chartData = [
  { name: "Jan", bookings: 12, revenue: 2400 },
  { name: "Feb", bookings: 19, revenue: 3800 },
  { name: "Mar", bookings: 15, revenue: 3000 },
  { name: "Apr", bookings: 22, revenue: 4400 },
  { name: "May", bookings: 28, revenue: 5600 },
  { name: "Jun", bookings: 25, revenue: 5000 },
];

const categoryData = mockCategories.map(cat => ({
  name: cat.name,
  value: cat.equipmentCount,
}));

const COLORS = ["hsl(199, 89%, 48%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(280, 65%, 60%)", "hsl(0, 84%, 60%)"];

const recentBookings = mockBookings.slice(0, 5);

export default function DashboardPage() {
  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back! Here's your overview.">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={stat.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-success" />
                    {stat.change}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Bookings Chart */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Booking Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
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

        {/* Category Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Equipment by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {categoryData.map((cat, index) => (
                <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{booking.equipmentName}</p>
                    <p className="text-sm text-muted-foreground">{booking.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${booking.totalPrice}</p>
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      booking.status === "completed"
                        ? "bg-success/10 text-success"
                        : booking.status === "confirmed"
                        ? "bg-primary/10 text-primary"
                        : booking.status === "pending"
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
