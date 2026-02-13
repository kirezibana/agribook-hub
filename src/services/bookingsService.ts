import fetchApi, { ApiResponse } from './apiClient';
import { Booking } from '@/data/mockData';

export interface BookingInput {
  equipmentId: number;
  customerId?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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
  if (filters?.status) query += `&status=${filters.status}`;
  if (filters?.customerId) query += `&customer_id=${filters.customerId}`;
  if (filters?.equipmentId) query += `&equipment_id=${filters.equipmentId}`;
  if (filters?.startDate) query += `&start_date=${filters.startDate}`;
  if (filters?.endDate) query += `&end_date=${filters.endDate}`;

  const response = await fetchApi<any[]>(query);

  if (response.status === 'success' && response.data) {
    return response.data.map(b => ({
      id: (b.id || '').toString(),
      equipmentId: (b.equipmentId || b.equipment_id || '').toString(),
      equipmentName: b.equipmentName || b.equipment_name || '',
      categoryName: b.categoryName || b.category_name || '',
      customerName: b.customerName || b.customer_name || '',
      customerPhone: b.customerPhone || b.customer_phone || '',
      customerEmail: b.customerEmail || b.customer_email || '',
      startDate: b.startDate || b.start_date || '',
      endDate: b.endDate || b.end_date || '',
      totalDays: Number(b.totalDays || b.total_days || 0),
      totalPrice: Number(b.totalPrice || b.total_price || b.totalCost || b.total_cost || 0),
      status: b.status || 'pending',
      createdAt: b.createdAt || b.created_at || '',
      notes: b.notes || '',
    }));
  }

  return [];
}

// Get single booking
export async function getBookingById(id: string): Promise<Booking | null> {
  const response = await fetchApi<any>(`bookings.php?action=read_one&id=${id}`);

  if (response.status === 'success' && response.data) {
    const b = response.data;
    return {
      id: (b.id || '').toString(),
      equipmentId: (b.equipmentId || b.equipment_id || '').toString(),
      equipmentName: b.equipmentName || b.equipment_name || '',
      categoryName: b.categoryName || b.category_name || '',
      customerName: b.customerName || b.customer_name || '',
      customerPhone: b.customerPhone || b.customer_phone || '',
      customerEmail: b.customerEmail || b.customer_email || '',
      startDate: b.startDate || b.start_date || '',
      endDate: b.endDate || b.end_date || '',
      totalDays: Number(b.totalDays || b.total_days || 0),
      totalPrice: Number(b.totalPrice || b.total_price || b.totalCost || b.total_cost || 0),
      status: b.status || 'pending',
      createdAt: b.createdAt || b.created_at || '',
      notes: b.notes || '',
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
