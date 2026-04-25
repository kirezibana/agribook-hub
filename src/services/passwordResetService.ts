// Password reset service - calls backend at http://localhost/agriAPIs/

const API_BASE_URL = 'http://localhost/agriAPIs';

export interface PasswordResetRequestResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    email?: string;
    phone?: string;
    code?: string; // returned for demo/test convenience
  };
}

export interface PasswordResetUpdateResponse {
  status: 'success' | 'error';
  message: string;
}

// Step 1: Request password reset by email.
// Backend: looks up user, gets phone, generates 4-digit code, saves into tbl_password_reset
export async function requestPasswordReset(email: string): Promise<PasswordResetRequestResponse> {
  try {
    const formData = new FormData();
    formData.append('email', email);

    const response = await fetch(`${API_BASE_URL}/forgotPassword.php`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    console.log('Forgot Password API Response:', result);
    return result;
  } catch (error: any) {
    console.error('Forgot Password API Error:', error);
    return { status: 'error', message: error.message || 'Failed to request password reset' };
  }
}

// Step 2: Update the user's password (plain text per project spec)
export async function updatePassword(email: string, newPassword: string): Promise<PasswordResetUpdateResponse> {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', newPassword);

    const response = await fetch(`${API_BASE_URL}/resetPassword.php`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    console.log('Reset Password API Response:', result);
    return result;
  } catch (error: any) {
    console.error('Reset Password API Error:', error);
    return { status: 'error', message: error.message || 'Failed to reset password' };
  }
}

// Verify the OTP code that was saved in tbl_password_reset for this email
export async function verifyResetCode(email: string, code: string): Promise<PasswordResetUpdateResponse> {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('code', code);

    const response = await fetch(`${API_BASE_URL}/verifyCode.php`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    console.log('Verify Code API Response:', result);
    return result;
  } catch (error: any) {
    console.error('Verify Code API Error:', error);
    return { status: 'error', message: error.message || 'Failed to verify code' };
  }
}
