# Agribook Hub - Backend APIs

Complete backend API system for agriculture equipment booking management. Built with PHP and MySQL.

## Setup Instructions

### 1. Database Setup
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Create a new database or use existing one
3. Import the `agribook_database.sql` file:
   - Go to "Import" tab
   - Select the SQL file
   - Click "Import"
4. This will create all tables and populate sample data

### 2. Configuration
- Edit `config.php` if needed:
  - DB_HOST: localhost
  - DB_USER: root (default XAMPP)
  - DB_PASS: '' (empty for default XAMPP)
  - DB_NAME: agribook_hub

### 3. Test the APIs
All APIs are accessible at: `http://localhost/agriAPIs/{endpoint}`

## API Endpoints

### Categories
- **Read All**: GET `/categories.php?action=read`
- **Read One**: GET `/categories.php?action=read_one&id=1`
- **Create**: POST `/categories.php?action=create`
  ```json
  {
    "name": "Tractors",
    "description": "Heavy-duty tractors"
  }
  ```
- **Update**: POST `/categories.php?action=update`
  ```json
  {
    "id": 1,
    "name": "Tractors",
    "description": "Updated description"
  }
  ```
- **Delete**: POST `/categories.php?action=delete`
  ```json
  {
    "id": 1
  }
  ```

### Equipment
- **Read All**: GET `/equipment.php?action=read`
  - Filters: `categoryId=1`, `status=available`
- **Read One**: GET `/equipment.php?action=read_one&id=1`
- **Create**: POST `/equipment.php?action=create`
  ```json
  {
    "name": "John Deere 5075E",
    "modelNumber": "JD-5075E",
    "categoryId": 1,
    "pricePerDay": 150,
    "description": "75 HP utility tractor",
    "image": "https://image.url",
    "status": "available"
  }
  ```
- **Update**: POST `/equipment.php?action=update`
- **Delete**: POST `/equipment.php?action=delete`

### Bookings
- **Read All**: GET `/bookings.php?action=read`
  - Filters: `status=pending`, `customerId=1`
- **Read One**: GET `/bookings.php?action=read_one&id=1`
- **Create**: POST `/bookings.php?action=create`
  ```json
  {
    "equipmentId": 1,
    "customerId": 2,
    "customerName": "John Doe",
    "customerPhone": "+255 700 000 000",
    "customerEmail": "john@example.com",
    "startDate": "2024-03-01",
    "endDate": "2024-03-05",
    "totalDays": 5,
    "totalPrice": 750,
    "status": "pending",
    "notes": "Additional notes"
  }
  ```
- **Update**: POST `/bookings.php?action=update`
- **Delete**: POST `/bookings.php?action=delete`

### Users/Customers
- **Create**: POST `/users.php?action=create`
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure_password",
    "phone": "+255 700 000 000",
    "role": "customer"
  }
  ```
- **Login**: POST `/users.php?action=login`
  ```json
  {
    "email": "john@example.com",
    "password": "secure_password"
  }
  ```
- **Read All**: GET `/users.php?action=read`
  - Filters: `role=customer`, `status=active`
- **Read One**: GET `/users.php?action=read_one&id=1`
- **Update**: POST `/users.php?action=update`
- **Delete**: POST `/users.php?action=delete`

### Dashboard Statistics
- **Get Stats**: GET `/dashboard.php`
  Returns:
  ```json
  {
    "status": "success",
    "data": {
      "totalEquipment": 6,
      "availableEquipment": 4,
      "totalBookings": 6,
      "pendingBookings": 2,
      "confirmedBookings": 2,
      "completedBookings": 2,
      "totalRevenue": 5445,
      "totalCustomers": 6,
      "totalCategories": 5,
      "recentBookings": [...],
      "equipmentStats": [...]
    }
  }
  ```

## Database Schema

### Tables
1. **users** - Admin and customer accounts
2. **categories** - Equipment categories
3. **equipment** - Available equipment inventory
4. **bookings** - Customer bookings
5. **payments** - Payment records
6. **reviews** - Customer reviews
7. **maintenance_logs** - Equipment maintenance tracking

### Key Relationships
- Equipment → Categories (many-to-one)
- Bookings → Equipment (many-to-one)
- Bookings → Users/Customers (many-to-one)
- Reviews → Bookings (one-to-one)
- Payments → Bookings (many-to-one)

## Response Format

All APIs return JSON in this format:

**Success:**
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Testing with Postman

1. **Import URLs**: Base URL = `http://localhost/agriAPIs`
2. **GET requests**: Use query parameters
3. **POST requests**: 
   - Set header: `Content-Type: application/json`
   - Put JSON body in raw format

## File Structure

```
agriAPIs/
├── config.php              # Database configuration
├── categories.php          # Category CRUD operations
├── equipment.php           # Equipment CRUD operations
├── bookings.php            # Booking CRUD operations
├── users.php               # User/Customer operations
├── dashboard.php           # Dashboard statistics
├── agribook_database.sql   # Database schema
└── README.md               # This file
```

## Features

✅ **Category Management**
- Create, read, update, delete categories
- Auto-count equipment per category

✅ **Equipment Management**
- Full CRUD operations
- Status tracking (available, booked, maintenance, retired)
- Category association
- Image storage

✅ **Booking System**
- Create and manage bookings
- Status tracking (pending, confirmed, completed, cancelled)
- Customer information handling
- Total price calculations
- Notes support

✅ **User Management**
- User registration with email validation
- Secure password hashing (bcrypt)
- Role-based access (admin, customer)
- Status management

✅ **Dashboard Analytics**
- Real-time statistics
- Revenue tracking
- Equipment usage metrics
- Recent bookings overview

✅ **Security Features**
- CORS headers enabled
- SQL injection prevention (prepared statements)
- Password hashing with bcrypt
- Status validation

## Notes

- All timestamps are in MySQL format
- Prices are stored as DECIMAL(10,2)
- IDs are auto-incrementing integers
- Soft delete not implemented (use status field instead if needed)
- Image URLs can be stored locally or as remote URLs

## Future Enhancements

- Payment gateway integration
- Email notifications
- SMS alerts
- Advanced reporting
- Equipment analytics
- Customer reviews system
- Maintenance scheduling
- Export to CSV/PDF
