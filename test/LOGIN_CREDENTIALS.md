# AgriBook Hub - Login Credentials

## ✅ Credentials Fixed - Now Working!

### Database Credentials
- **Host:** localhost
- **Database:** agribook_hub
- **User:** root
- **Password:** (empty)

### API Base URL
- `http://localhost/agriAPIs`

---

## Demo User Accounts (All Working)

### Admin Account
- **Email:** `admin@agribook.com`
- **Password:** `admin123`
- **Role:** Admin
- **Access:** Dashboard, Equipment, Bookings, Categories, Users management

### Customer Accounts
All of the following customer accounts work with password: `password123`

1. **James Mwangi**
   - Email: `james@example.com`

2. **Sarah Okonkwo**
   - Email: `sarah@example.com`

3. **Emmanuel Banda**
   - Email: `emmanuel@example.com`

4. **Grace Kimani**
   - Email: `grace@example.com`

5. **Peter Mutua**
   - Email: `peter@example.com`

6. **Alice Wanjiku**
   - Email: `alice@example.com`

---

## What Was Fixed

### Problem
The database had plain text passwords in the original SQL schema, but the PHP login endpoint uses `password_hash()` with bcrypt encryption for security. This caused all login attempts to fail with "Invalid email or password".

### Solution
Updated all user passwords in the database with proper bcrypt hashes:
- Admin password hashed from: `admin123`
- Customer passwords hashed from: `password123`

### Verification
✅ All login API endpoints tested and working correctly  
✅ Admin login successful  
✅ Customer login successful  
✅ Frontend LoginPage updated with correct demo credentials  

---

## Testing Login

You can test login in multiple ways:

### 1. Using the Frontend
Navigate to the login page and use any of the credentials above.

### 2. Using cURL
```bash
curl -X POST http://localhost/agriAPIs/users.php?action=login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agribook.com","password":"admin123"}'
```

### 3. Using PowerShell
```powershell
Invoke-WebRequest -Uri 'http://localhost/agriAPIs/users.php?action=login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body (ConvertTo-Json @{email='admin@agribook.com'; password='admin123'}) `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

## Summary

The AgriBook Hub system is now fully functional with proper authentication. All API endpoints are connected to the frontend, and login works with both admin and customer accounts.
