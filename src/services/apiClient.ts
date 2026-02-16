// API Base URL
const API_BASE_URL = 'http://localhost/agriAPIs';

// Response interface
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

// Fetch helper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}/${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data); // Debug log
    return data;
  } catch (error: any) {
    console.error('API Error:', error);
    return {
      status: 'error',
      message: error.message || 'Failed to fetch data. Please check your connection.',
    };
  }
}

// Export for use in all services
export default fetchApi;
