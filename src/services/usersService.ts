import fetchApi, { ApiResponse } from './apiClient';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'customer';
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'customer';
  token?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role?: 'admin' | 'customer';
}

// Register new user
export async function registerUser(data: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
  return fetchApi<LoginResponse>('users.php?action=create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Login user
export async function loginUser(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return fetchApi<LoginResponse>('users.php?action=login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Get all users
export async function getUsers(): Promise<User[]> {
  const response = await fetchApi<User[]>('users.php?action=read');
  
  if (response.status === 'success' && response.data) {
    return response.data.map(user => ({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
    }));
  }
  
  return [];
}

// Get single user
export async function getUserById(id: string): Promise<User | null> {
  const response = await fetchApi<User>(`users.php?action=read_one&id=${id}`);
  
  if (response.status === 'success' && response.data) {
    const user = response.data;
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
  
  return null;
}

// Update user
export async function updateUser(id: string, data: Partial<User>): Promise<ApiResponse<any>> {
  return fetchApi('users.php?action=update', {
    method: 'POST',
    body: JSON.stringify({ id: parseInt(id), ...data }),
  });
}

// Delete user
export async function deleteUser(id: string): Promise<ApiResponse<any>> {
  return fetchApi('users.php?action=delete', {
    method: 'POST',
    body: JSON.stringify({ id: parseInt(id) }),
  });
}

// Get users by role
export async function getUsersByRole(role: 'admin' | 'customer'): Promise<User[]> {
  const users = await getUsers();
  return users.filter(user => user.role === role);
}
