import fetchApi, { ApiResponse } from './apiClient';
import { Booking } from '@/data/mockData';

export interface BookingInput {
  equipment_id: number;
  customer_id: number;
  start_date: string;
  end_date: string;
  booking_type: 'hourly' | 'daily';
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalCost: number;
}

export interface BookingResponse extends Booking {
  equipmentName: string;
  customerName: string;
  customerEmail: string;
}

// Create booking
export async function createBooking(data: BookingInput): Promise<ApiResponse<any>> {
  return fetchApi('bookings.php?action=create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Get all bookings
export async function getBookings(filters?: {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  customerId?: number;
  equipmentId?: number;
  startDate?: string;
  endDate?: string;
}): Promise<Booking[]> {
  let query = 'bookings.php?action=read';
  
  if (filters?.status) {
    query += `&status=${filters.status}`;
  }
  if (filters?.customerId) {
    query += `&customer_id=${filters.customerId}`;
  }
  if (filters?.equipmentId) {
    query += `&equipment_id=${filters.equipmentId}`;
  }
  if (filters?.startDate) {
    query += `&start_date=${filters.startDate}`;
  }
  if (filters?.endDate) {
    query += `&end_date=${filters.endDate}`;
  }
  
  const response = await fetchApi<BookingResponse[]>(query);
  
  if (response.status === 'success' && response.data) {
    return response.data.map(booking => ({
      id: booking.id.toString(),
      equipmentId: booking.equipment_id?.toString() || booking.equipmentId,
      equipmentName: booking.equipmentName || booking.equipment,
      customerId: booking.customer_id?.toString() || booking.customerId,
      customerName: booking.customerName || booking.customer,
      customerEmail: booking.customerEmail || booking.email,
      categoryName: booking.categoryName || booking.category,
      startDate: booking.startDate || booking.start_date,
      endDate: booking.endDate || booking.end_date,
      status: booking.status as any,
      totalDays: booking.totalDays !== undefined ? Number(booking.totalDays) : 0,
      totalPrice: booking.totalPrice !== undefined ? Number(booking.totalPrice) : 0,
      createdAt: booking.createdAt || booking.created_at || '',
      notes: booking.notes,
    }));
  }
  
  return [];
}

// Get single booking
export async function getBookingById(id: string): Promise<Booking | null> {
  const response = await fetchApi<BookingResponse>(`bookings.php?action=read_one&id=${id}`);
  
  if (response.status === 'success' && response.data) {
    const booking = response.data;
    return {
      id: booking.id.toString(),
      equipmentId: booking.equipment_id?.toString() || booking.equipmentId,
      equipmentName: booking.equipmentName || booking.equipment,
      customerId: booking.customer_id?.toString() || booking.customerId,
      customerName: booking.customerName || booking.customer,
      customerEmail: booking.customerEmail || booking.email,
      startDate: new Date(booking.start_date || booking.startDate),
      endDate: new Date(booking.end_date || booking.endDate),
      bookingType: booking.booking_type || booking.type,
      status: booking.status as any,
      totalCost: booking.totalCost || booking.total_cost,
      createdAt: booking.createdAt || new Date(),
      notes: booking.notes,
    };
  }
  
  return null;
}

// Update booking
export async function updateBooking(id: string, data: Partial<BookingInput>): Promise<ApiResponse<any>> {
  return fetchApi('bookings.php?action=update', {
    method: 'POST',
    body: JSON.stringify({ id: parseInt(id), ...data }),
  });
}

// Delete booking
export async function deleteBooking(id: string): Promise<ApiResponse<any>> {
  return fetchApi('bookings.php?action=delete', {
    method: 'POST',
    body: JSON.stringify({ id: parseInt(id) }),
  });
}

// Get bookings by status
export async function getBookingsByStatus(status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): Promise<Booking[]> {
  return getBookings({ status });
}

// Get customer bookings
export async function getCustomerBookings(customerId: number): Promise<Booking[]> {
  return getBookings({ customerId });
}
