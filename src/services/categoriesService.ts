import fetchApi, { ApiResponse } from './apiClient';
import { Category } from '@/data/mockData';

export interface CategoryInput {
  name: string;
  description?: string;
}

export interface CategoryResponse extends Category {
  equipmentCount: number;
}

// Create category
export async function createCategory(data: CategoryInput): Promise<ApiResponse<any>> {
  return fetchApi('categories.php?action=create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  const response = await fetchApi<CategoryResponse[]>('categories.php?action=read');
  
  if (response.status === 'success' && response.data) {
    return response.data.map(cat => ({
      id: cat.id.toString(),
      name: cat.name,
      description: cat.description,
      equipmentCount: cat.equipmentCount,
      createdAt: cat.createdAt,
    }));
  }
  
  return [];
}

// Get single category
export async function getCategory(id: string): Promise<Category | null> {
  const response = await fetchApi<CategoryResponse>(`categories.php?action=read_one&id=${id}`);
  
  if (response.status === 'success' && response.data) {
    const cat = response.data;
    return {
      id: cat.id.toString(),
      name: cat.name,
      description: cat.description,
      equipmentCount: cat.equipmentCount,
      createdAt: cat.createdAt,
    };
  }
  
  return null;
}

// Update category
export async function updateCategory(id: string, data: CategoryInput): Promise<ApiResponse<any>> {
  return fetchApi('categories.php?action=update', {
    method: 'POST',
    body: JSON.stringify({ id: parseInt(id), ...data }),
  });
}

// Delete category
export async function deleteCategory(id: string): Promise<ApiResponse<any>> {
  return fetchApi('categories.php?action=delete', {
    method: 'POST',
    body: JSON.stringify({ id: parseInt(id) }),
  });
}
