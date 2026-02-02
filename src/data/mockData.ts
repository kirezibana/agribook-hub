// Mock data for the agriculture equipment booking system

export interface Category {
  id: string;
  name: string;
  description: string;
  equipmentCount: number;
  createdAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  modelNumber: string;
  categoryId: string;
  categoryName: string;
  pricePerDay: number;
  description: string;
  image: string;
  status: "available" | "booked" | "maintenance";
  createdAt: string;
}

export interface Booking {
  id: string;
  equipmentId: string;
  equipmentName: string;
  categoryName: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

export const mockCategories: Category[] = [
  { id: "1", name: "Tractors", description: "Heavy-duty farming tractors", equipmentCount: 8, createdAt: "2024-01-15" },
  { id: "2", name: "Harvesters", description: "Crop harvesting machines", equipmentCount: 5, createdAt: "2024-01-20" },
  { id: "3", name: "Seeders", description: "Planting and seeding equipment", equipmentCount: 6, createdAt: "2024-02-01" },
  { id: "4", name: "Irrigation", description: "Water management systems", equipmentCount: 10, createdAt: "2024-02-10" },
  { id: "5", name: "Tillers", description: "Soil preparation machinery", equipmentCount: 4, createdAt: "2024-02-15" },
];

export const mockEquipment: Equipment[] = [
  { id: "1", name: "John Deere 5075E", modelNumber: "JD-5075E", categoryId: "1", categoryName: "Tractors", pricePerDay: 150, description: "75 HP utility tractor perfect for medium farms", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400", status: "available", createdAt: "2024-01-15" },
  { id: "2", name: "Kubota M7-172", modelNumber: "KM7-172", categoryId: "1", categoryName: "Tractors", pricePerDay: 200, description: "172 HP premium tractor with advanced features", image: "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=400", status: "booked", createdAt: "2024-01-20" },
  { id: "3", name: "Case IH Axial-Flow", modelNumber: "CI-AF8250", categoryId: "2", categoryName: "Harvesters", pricePerDay: 350, description: "High-capacity combine harvester", image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400", status: "available", createdAt: "2024-02-01" },
  { id: "4", name: "Great Plains 3S-4000", modelNumber: "GP-3S4000", categoryId: "3", categoryName: "Seeders", pricePerDay: 120, description: "40-foot grain drill for efficient seeding", image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400", status: "available", createdAt: "2024-02-10" },
  { id: "5", name: "Valley Center Pivot", modelNumber: "VC-8000", categoryId: "4", categoryName: "Irrigation", pricePerDay: 80, description: "Center pivot irrigation system", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400", status: "maintenance", createdAt: "2024-02-15" },
  { id: "6", name: "Honda FG110", modelNumber: "HFG-110", categoryId: "5", categoryName: "Tillers", pricePerDay: 45, description: "Mini tiller for small gardens", image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400", status: "available", createdAt: "2024-02-20" },
];

export const mockBookings: Booking[] = [
  { id: "1", equipmentId: "1", equipmentName: "John Deere 5075E", categoryName: "Tractors", customerName: "James Mwangi", customerPhone: "+255 712 345 678", startDate: "2024-03-01", endDate: "2024-03-05", totalDays: 5, totalPrice: 750, status: "completed", createdAt: "2024-02-28" },
  { id: "2", equipmentId: "2", equipmentName: "Kubota M7-172", categoryName: "Tractors", customerName: "Sarah Okonkwo", customerPhone: "+255 723 456 789", startDate: "2024-03-10", endDate: "2024-03-15", totalDays: 6, totalPrice: 1200, status: "confirmed", createdAt: "2024-03-08" },
  { id: "3", equipmentId: "3", equipmentName: "Case IH Axial-Flow", categoryName: "Harvesters", customerName: "Emmanuel Banda", customerPhone: "+255 734 567 890", startDate: "2024-03-20", endDate: "2024-03-25", totalDays: 6, totalPrice: 2100, status: "pending", createdAt: "2024-03-18" },
  { id: "4", equipmentId: "4", equipmentName: "Great Plains 3S-4000", categoryName: "Seeders", customerName: "Grace Kimani", customerPhone: "+255 745 678 901", startDate: "2024-03-12", endDate: "2024-03-14", totalDays: 3, totalPrice: 360, status: "confirmed", createdAt: "2024-03-10" },
  { id: "5", equipmentId: "6", equipmentName: "Honda FG110", categoryName: "Tillers", customerName: "Peter Mutua", customerPhone: "+255 756 789 012", startDate: "2024-03-08", endDate: "2024-03-10", totalDays: 3, totalPrice: 135, status: "completed", createdAt: "2024-03-06" },
  { id: "6", equipmentId: "1", equipmentName: "John Deere 5075E", categoryName: "Tractors", customerName: "Alice Wanjiku", customerPhone: "+255 767 890 123", startDate: "2024-03-25", endDate: "2024-03-30", totalDays: 6, totalPrice: 900, status: "pending", createdAt: "2024-03-22" },
];
