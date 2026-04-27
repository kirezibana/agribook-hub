// Password reset service - calls backend at http://localhost/agriAPIs/

const API_BASE_URL = 'http://localhost/agriAPIs';

export interface PasswordResetRequestResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    email?: string;
    phone?: string;
    code?: string;
  };
}

export interface PasswordResetUpdateResponse {
  status: 'success' | 'error';
  message: string;
}

/**
 * The backend may emit the SMS gateway's JSON response BEFORE its own
 * sendResponse() JSON, producing a body like:
 *   {"status":"ok",...}{"status":"success","message":"Reset code sent..."}
 *
 * Standard JSON.parse fails on that. This helper extracts and returns the
 * LAST top-level JSON object from the text, which is the app's own response.
 */
function parseLastJsonObject(text: string): any {
  const trimmed = text.trim();
  // Fast path: clean JSON
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }

  // Walk the string and find boundaries of top-level {...} objects
  const objects: string[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        objects.push(trimmed.slice(start, i + 1));
        start = -1;
      }
    }
  }

  // Try parsing from the last object backwards
  for (let i = objects.length - 1; i >= 0; i--) {
    try {
      const obj = JSON.parse(objects[i]);
      // Prefer the one that looks like our app response
      if (obj && typeof obj === 'object' && 'status' in obj && 'message' in obj) {
        return obj;
      }
    } catch {
      // try next
    }
  }

  // Fallback: parse last successfully
  for (let i = objects.length - 1; i >= 0; i--) {
    try { return JSON.parse(objects[i]); } catch { /* noop */ }
  }

  throw new Error('Invalid JSON response from server');
}

async function postForm(endpoint: string, fields: Record<string, string>) {
  const formData = new FormData();
  for (const [k, v] of Object.entries(fields)) formData.append(k, v);

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: 'POST',
    body: formData,
  });
  const text = await response.text();
  console.log(`[${endpoint}] raw response:`, text);
  return parseLastJsonObject(text);
}

// Step 1: Request password reset by email.
export async function requestPasswordReset(email: string): Promise<PasswordResetRequestResponse> {
  try {
    const result = await postForm('forgotPassword.php', { email });
    console.log('Forgot Password parsed:', result);
    return result;
  } catch (error: any) {
    console.error('Forgot Password API Error:', error);
    return { status: 'error', message: error.message || 'Failed to request password reset' };
  }
}

// Step 2: Update the user's password (plain text per project spec)
export async function updatePassword(email: string, newPassword: string): Promise<PasswordResetUpdateResponse> {
  try {
    const result = await postForm('resetPassword.php', { email, password: newPassword });
    console.log('Reset Password parsed:', result);
    return result;
  } catch (error: any) {
    console.error('Reset Password API Error:', error);
    return { status: 'error', message: error.message || 'Failed to reset password' };
  }
}

// Verify the OTP code that was saved in tbl_password_reset for this email
export async function verifyResetCode(email: string, code: string): Promise<PasswordResetUpdateResponse> {
  try {
    const result = await postForm('verifyCode.php', { email, code });
    console.log('Verify Code parsed:', result);
    return result;
  } catch (error: any) {
    console.error('Verify Code API Error:', error);
    return { status: 'error', message: error.message || 'Failed to verify code' };
  }
}
