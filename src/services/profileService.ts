import fetchApi, { ApiResponse } from './apiClient';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface UpdateProfileRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const updateUserProfile = async (
  profileData: UpdateProfileRequest
): Promise<ApiResponse<UserProfile>> => {
  const formData = new FormData();
  formData.append('name', profileData.name);
  formData.append('email', profileData.email);
  formData.append('phone', profileData.phone);
  formData.append('address', profileData.address);

  // Since the API might return user data in the response, we'll handle it as UserProfile
  return fetchApi<UserProfile>('update_profile.php', {
    method: 'POST',
    body: formData,
  });
};

export const getUserProfile = async (): Promise<ApiResponse<UserProfile>> => {
  return fetchApi<UserProfile>('get_profile.php', {
    method: 'GET',
  });
};