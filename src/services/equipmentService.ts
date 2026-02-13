import fetchApi, { ApiResponse } from './apiClient';
import { Equipment } from '@/data/mockData';
import { formatImagePath } from '@/lib/imageUtils';

// API Base URL
const API_BASE_URL = 'http://localhost/agriAPIs';

export interface EquipmentInput {
  name: string;
  modelNumber?: string;
  category_id: number;
  description?: string;
  daily_rate: number;
  hourly_rate?: number;
  status: 'available' | 'maintenance' | 'unavailable';
}

// Create equipment with file upload support
export async function createEquipment(data: EquipmentInput, file?: File): Promise<ApiResponse<any>> {
  if (file) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('modelNumber', data.modelNumber || '');
    formData.append('categoryId', data.category_id.toString());
    formData.append('pricePerDay', data.daily_rate.toString());
    formData.append('description', data.description || '');
    formData.append('image', file);
    formData.append('status', data.status);

    try {
      const response = await fetch(`${API_BASE_URL}/equipment.php?action=create`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { status: 'error', message: 'Failed to upload equipment. Please check your connection.' };
    }
  } else {
    const payload = {
      name: data.name,
      modelNumber: data.modelNumber || '',
      categoryId: data.category_id,
      pricePerDay: data.daily_rate,
      description: data.description || '',
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
  if (filters?.categoryId) query += `&categoryId=${filters.categoryId}`;
  if (filters?.status) query += `&status=${filters.status}`;

  const response = await fetchApi<any[]>(query);

  if (response.status === 'success' && response.data) {
    return response.data.map(eq => ({
      id: eq.id?.toString() || '',
      name: eq.name || '',
      modelNumber: eq.modelNumber || eq.model_number || '',
      categoryId: (eq.categoryId || eq.category_id || '').toString(),
      categoryName: eq.categoryName || eq.category_name || '',
      pricePerDay: Number(eq.pricePerDay || eq.price_per_day || eq.daily_rate || 0),
      description: eq.description || '',
      image: formatImagePath(eq.image || eq.imageUrl || ''),
      status: eq.status || 'available',
      createdAt: eq.createdAt || eq.created_at || '',
    }));
  }

  return [];
}

// Get single equipment
export async function getEquipmentById(id: string): Promise<Equipment | null> {
  const response = await fetchApi<any>(`equipment.php?action=read_one&id=${id}`);

  if (response.status === 'success' && response.data) {
    const eq = response.data;
    return {
      id: eq.id?.toString() || '',
      name: eq.name || '',
      modelNumber: eq.modelNumber || eq.model_number || '',
      categoryId: (eq.categoryId || eq.category_id || '').toString(),
      categoryName: eq.categoryName || eq.category_name || '',
      pricePerDay: Number(eq.pricePerDay || eq.price_per_day || eq.daily_rate || 0),
      description: eq.description || '',
      image: formatImagePath(eq.image || eq.imageUrl || ''),
      status: eq.status || 'available',
      createdAt: eq.createdAt || eq.created_at || '',
    };
  }

  return null;
}

// Update equipment
export async function updateEquipment(id: string, data: Partial<EquipmentInput>, file?: File): Promise<ApiResponse<any>> {
  if (file) {
    const formData = new FormData();
    formData.append('id', id);
    if (data.name) formData.append('name', data.name);
    if (data.modelNumber) formData.append('modelNumber', data.modelNumber);
    if (data.category_id) formData.append('categoryId', data.category_id.toString());
    if (data.daily_rate) formData.append('pricePerDay', data.daily_rate.toString());
    if (data.description) formData.append('description', data.description);
    if (data.status) formData.append('status', data.status);
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/equipment.php?action=update`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { status: 'error', message: 'Failed to update equipment.' };
    }
  } else {
    return fetchApi('equipment.php?action=update', {
      method: 'POST',
      body: JSON.stringify({
        id: parseInt(id),
        name: data.name,
        modelNumber: data.modelNumber,
        categoryId: data.category_id,
        pricePerDay: data.daily_rate,
        description: data.description,
        status: data.status,
      }),
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
