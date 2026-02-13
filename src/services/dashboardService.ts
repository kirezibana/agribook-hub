import fetchApi, { ApiResponse } from './apiClient';
import { Booking } from '@/data/mockData';

export interface DashboardStats {
  totalEquipment: number;
  availableEquipment: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  totalCustomers: number;
  totalCategories: number;
  recentBookings: Array<{
    id: string;
    equipment: string;
    customer: string;
    date: string;
    status: string;
  }>;
  equipmentStats: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
  monthlyTrends: Array<{
    name: string;
    bookings: number;
    revenue: number;
  }>;
  categoryStats: Array<{
    name: string;
    value: number;
  }>;
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetchApi<DashboardStats>('dashboard.php?action=read');
  
  if (response.status === 'success' && response.data) {
    return response.data;
  }
  
  // Return default empty stats if fetch fails
  return {
    totalEquipment: 0,
    availableEquipment: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalCategories: 0,
    recentBookings: [],
    equipmentStats: [],
    monthlyTrends: [],
    categoryStats: [],
  };
}

// Get revenue summary
export async function getRevenueSummary(): Promise<{
  totalRevenue: number;
  thisMonth: number;
  thisWeek: number;
}> {
  const response = await fetchApi<any>('dashboard.php?action=revenue');
  
  if (response.status === 'success' && response.data) {
    return response.data;
  }
  
  return {
    totalRevenue: 0,
    thisMonth: 0,
    thisWeek: 0,
  };
}

// Get booking trends
export async function getBookingTrends(): Promise<Array<{
  date: string;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}>> {
  const response = await fetchApi<any>('dashboard.php?action=trends');
  
  if (response.status === 'success' && response.data) {
    return response.data;
  }
  
  return [];
}

// Get category performance
export async function getCategoryPerformance(): Promise<Array<{
  categoryId: string;
  categoryName: string;
  equipmentCount: number;
  bookingCount: number;
  revenue: number;
}>> {
  const response = await fetchApi<any>('dashboard.php?action=category_performance');
  
  if (response.status === 'success' && response.data) {
    return response.data;
  }
  
  return [];
}
