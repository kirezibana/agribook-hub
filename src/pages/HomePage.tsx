import { useState, useEffect } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Search,
  DollarSign,
  MapPin,
  Calendar,
  Star,
  Loader2,
} from "lucide-react";
import { Equipment } from "@/data/mockData";
import { getEquipment } from "@/services/equipmentService";
import { getCategories } from "@/services/categoriesService";
import { BookingModal } from "@/components/dialogs/BookingModal";

export default function HomePage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [equipmentData, categoriesData] = await Promise.all([
        getEquipment({ status: "available" }),
        getCategories(),
      ]);

      setEquipment(equipmentData);
      setCategories(categoriesData);
    } catch (err) {
      setError("Failed to load equipment. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.categoryId === categoryFilter;
    const matchesStatus = item.status === "available";

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleBookClick = (item: Equipment) => {
    setSelectedEquipment(item);
    setBookingOpen(true);
  };

  const handleBookingSuccess = () => {
    // Refresh equipment list to update availability
    fetchData();
  };

  if (loading) {
    return (
      <CustomerLayout title="Browse Equipment" subtitle="Find and book the equipment you need">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-video bg-muted" />
              <CardContent className="p-4 space-y-3">
                <div className="h-6 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout title="Browse Equipment" subtitle="Find and book the equipment you need">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold">Failed to load equipment</p>
                <p className="text-sm">{error}</p>
              </div>
              <Button
                variant="outline"
                onClick={fetchData}
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
      title="Browse Equipment"
      subtitle="Find and book the agricultural equipment you need"
    >
      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 px-4 rounded-lg h-11">
          <span>Showing {filteredEquipment.length} equipment</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            className="h-auto p-0"
          >
            <Loader2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-xl transition-shadow group"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-success/90 text-white border-0">
                    Available
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="space-y-1">
                  <h3 className="font-bold text-lg line-clamp-2">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>

                {/* Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>Price</span>
                    </div>
                    <span className="font-semibold text-primary">
                      ${item.dailyRate}/day
                    </span>
                  </div>

                  {item.totalBookings !== undefined && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Bookings</span>
                      </div>
                      <span className="font-semibold">{item.totalBookings}</span>
                    </div>
                  )}

                  {item.rating !== undefined && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>Rating</span>
                      </div>
                      <span className="font-semibold">{item.rating}/5</span>
                    </div>
                  )}
                </div>

                {/* Book Button */}
                <Button
                  onClick={() => handleBookClick(item)}
                  className="w-full h-11 gradient-primary text-white font-semibold"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Equipment Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || categoryFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "No available equipment at the moment"}
            </p>
            {(searchQuery || categoryFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Modal */}
      <BookingModal
        equipment={selectedEquipment}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        onSuccess={handleBookingSuccess}
      />
    </CustomerLayout>
  );
}
