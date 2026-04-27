import fetchApi, { ApiResponse } from './apiClient';

interface UserProfile {
  id?: number | string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface UpdateProfileRequest {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const updateUserProfile = async (
  profileData: UpdateProfileRequest
): Promise<ApiResponse<UserProfile>> => {
  const formData = new FormData();
  formData.append('id', String(profileData.id));
  formData.append('name', profileData.name);
  formData.append('email', profileData.email);
  formData.append('phone', profileData.phone);
  formData.append('address', profileData.address);

  return fetchApi<UserProfile>('update_profile.php', {
    method: 'POST',
    body: formData,
    headers: {}, // let browser set multipart boundary
  });
};

export const getUserProfile = async (
  id: number | string
): Promise<ApiResponse<UserProfile>> => {
  return fetchApi<UserProfile>(`get_profile.php?id=${encodeURIComponent(String(id))}`, {
    method: 'GET',
  });
};
