import fetchApi, { ApiResponse } from './apiClient';
import { Equipment } from '@/data/mockData';
import { formatImagePath } from '@/lib/imageUtils';

// API Base URL - duplicated here since it's not exported from apiClient
const API_BASE_URL = 'http://localhost/agriAPIs';

export interface EquipmentInput {
  name: string;
  modelNumber?: string;
  category_id: number;
  description?: string;
  hourly_rate: number;
  daily_rate: number;
  status: 'available' | 'maintenance' | 'unavailable';
}

export interface EquipmentResponse extends Equipment {
  categoryName: string;
}

// Create equipment with file upload support
export async function createEquipment(data: EquipmentInput, file?: File): Promise<ApiResponse<any>> {
  if (file) {
    // Handle file upload using FormData
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('modelNumber', data.modelNumber || '');
    formData.append('categoryId', data.category_id.toString());
    formData.append('hourly_rate', data.hourly_rate.toString());
    formData.append('pricePerDay', data.daily_rate.toString());
    formData.append('description', data.description || '');
    formData.append('image', file);
    formData.append('status', data.status);

    try {
      const response = await fetch(`${API_BASE_URL}/equipment.php?action=create`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return {
        status: 'error',
        message: 'Failed to upload equipment. Please check your connection.',
      };
    }
  } else {
    // Handle regular API call without file (for backward compatibility)
    const payload = {
      name: data.name,
      modelNumber: data.modelNumber || '',
      categoryId: data.category_id,
      pricePerDay: data.daily_rate,
      description: data.description || '',
      image: data.imageUrl || '',
      status: data.status,
    };

    return fetchApi('equipment.php?action=create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

// Get all equipment
export async function getEquipment(filters?: {
  categoryId?: number;
  status?: 'available' | 'maintenance' | 'unavailable';
}): Promise<Equipment[]> {
  let query = 'equipment.php?action=read';
  
  if (filters?.categoryId) {
    query += `&categoryId=${filters.categoryId}`;
  }
  if (filters?.status) {
    query += `&status=${filters.status}`;
  }
  
  const response = await fetchApi<EquipmentResponse[]>(query);
  
  if (response.status === 'success' && response.data) {
    return response.data.map(eq => ({
      id: eq.id.toString(),
      name: eq.name,
      category: eq.categoryName || eq.category,
      categoryId: eq.categoryId || eq.id,
      description: eq.description,
      hourlyRate: eq.hourly_rate || eq.hourlyRate || 0,
      dailyRate: eq.pricePerDay || eq.dailyRate || 0,
      status: eq.status as any,
      image: formatImagePath(eq.image || eq.imageUrl),
      availability: eq.availability,
      totalBookings: eq.totalBookings,
      rating: eq.rating,
      createdAt: eq.createdAt,
    }));
  }
  
  return [];
}

// Get single equipment
export async function getEquipmentById(id: string): Promise<Equipment | null> {
  const response = await fetchApi<EquipmentResponse>(`equipment.php?action=read_one&id=${id}`);
  
  if (response.status === 'success' && response.data) {
    const eq = response.data;
    return {
      id: eq.id.toString(),
      name: eq.name,
      category: eq.categoryName || eq.category,
      categoryId: eq.categoryId || eq.id,
      description: eq.description,
      hourlyRate: eq.hourly_rate || eq.hourlyRate,
      dailyRate: eq.pricePerDay || eq.dailyRate,
      status: eq.status as any,
      image: formatImagePath(eq.image || eq.imageUrl),
      availability: eq.availability,
      totalBookings: eq.totalBookings,
      rating: eq.rating,
      createdAt: eq.createdAt,
    };
  }
  
  return null;
}

// Update equipment
export async function updateEquipment(id: string, data: Partial<EquipmentInput>, file?: File): Promise<ApiResponse<any>> {
  if (file) {
    // Handle file upload using FormData
    const formData = new FormData();
    formData.append('id', id);
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/equipment.php?action=update`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return {
        status: 'error',
        message: 'Failed to update equipment. Please check your connection.',
      };
    }
  } else {
    // Handle regular API call without file
    return fetchApi('equipment.php?action=update', {
      method: 'POST',
      body: JSON.stringify({ id: parseInt(id), ...data }),
    });
  }
}

// Delete equipment
export async function deleteEquipment(id: string): Promise<ApiResponse<any>> {
  return fetchApi('equipment.php?action=delete', {
    method: 'POST',
    body: JSON.stringify({ id: parseInt(id) }),
  });
}
