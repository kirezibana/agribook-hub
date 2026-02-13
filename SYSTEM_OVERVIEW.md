# AgriRent - Complete System Overview

## 🎯 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AGRIRENT PLATFORM                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐          ┌──────────────────┐         │
│  │   CUSTOMER PORTAL │          │   ADMIN PORTAL   │         │
│  └──────────────────┘          └──────────────────┘         │
│         ↓                              ↓                     │
│  ┌──────────────────┐          ┌──────────────────┐         │
│  │  /login          │          │ /admin-login     │         │
│  │  /home           │          │ /dashboard       │         │
│  │  /my-bookings    │          │ /equipment       │         │
│  │                  │          │ /bookings        │         │
│  │                  │          │ /categories      │         │
│  └──────────────────┘          │ /reports         │         │
│                                 └──────────────────┘         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
          ↓                              ↓
  ┌──────────────────────────────────────────────┐
  │      BACKEND APIS (PHP)                      │
  │  http://localhost/agriAPIs/                  │
  │                                              │
  │  • users.php (login, registration)           │
  │  • equipment.php (CRUD, filtering)           │
  │  • categories.php (CRUD)                     │
  │  • bookings.php (CRUD, availability)         │
  │  • dashboard.php (statistics)                │
  └──────────────────────────────────────────────┘
          ↓
  ┌──────────────────────────────────────────────┐
  │      MYSQL DATABASE (agribook_hub)           │
  │                                              │
  │  • users (admin/customer accounts)           │
  │  • categories (equipment types)              │
  │  • equipment (rental items)                  │
  │  • bookings (customer reservations)          │
  │  • payments (transaction records)            │
  │  • reviews (customer feedback)               │
  │  • maintenance_logs (equipment service)      │
  └──────────────────────────────────────────────┘
```

---

## 👥 User Roles & Access

### CUSTOMER ROLE
**Email:** `james@example.com` | **Password:** `password123`

**Access:**
- ✅ `/login` - Login page
- ✅ `/home` - Browse available equipment
- ✅ `/my-bookings` - View their bookings
- ❌ No access to admin pages

**Capabilities:**
- Search equipment by name
- Filter equipment by category
- View equipment details (price, ratings, descriptions)
- Book equipment (select dates, confirm)
- View booking history
- Cancel pending bookings

### ADMIN ROLE
**Email:** `admin@agribook.com` | **Password:** `admin123`

**Access:**
- ✅ `/admin-login` - Dedicated admin login
- ✅ `/dashboard` - Dashboard & statistics
- ✅ `/equipment` - Manage equipment (CRUD)
- ✅ `/categories` - Manage categories (CRUD)
- ✅ `/bookings` - View all bookings
- ✅ `/reports` - Analytics & reports
- ❌ Cannot access customer portal

**Capabilities:**
- Add/edit/delete equipment
- Manage equipment categories
- View all customer bookings
- Approve/reject bookings
- Generate reports
- View revenue analytics

---

## 📍 Customer Journey

### 1. Login & Access
```
Customer visits site
  ↓
Redirected to /login
  ↓
Enters credentials (james@example.com / password123)
  ↓
Authenticates with API
  ↓
Redirected to /home (customer portal)
```

### 2. Browse Equipment
```
On /home page
  ↓
Filters equipment:
  • Search by name
  • Filter by category
  • View available items only
  ↓
Equipment fetched from database
  ↓
API call: equipment.php?action=read&status=available
```

### 3. Book Equipment
```
Customer clicks "Book Now" on equipment
  ↓
BookingModal opens
  ↓
Selects start date and end date
  ↓
System calculates:
  • Duration in days
  • Total cost (days × daily_rate)
  ↓
Customer confirms booking
  ↓
API call: bookings.php?action=create
  ↓
Data saved to bookings table
  ↓
Success notification shown
  ↓
Equipment list refreshes
```

### 4. View Bookings
```
Customer clicks "My Bookings" in navigation
  ↓
Navigates to /my-bookings
  ↓
API fetches customer's bookings
  ↓
API call: bookings.php?action=read&customer_id=X
  ↓
Displays:
  • Equipment name
  • Booking dates
  • Duration
  • Total cost
  • Status (pending/confirmed/completed/cancelled)
  ↓
Can cancel pending bookings
```

---

## 🔌 API Integration Points

### Equipment Browsing
```
GET /agriAPIs/equipment.php?action=read&status=available&category_id=1
Response:
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "John Deere 5075E",
      "category": "Tractors",
      "dailyRate": 150,
      "description": "...",
      "imageUrl": "...",
      "status": "available"
    }
  ]
}
```

### Creating Booking
```
POST /agriAPIs/bookings.php?action=create
Body:
{
  "equipment_id": 1,
  "customer_id": 2,
  "start_date": "2024-02-10",
  "end_date": "2024-02-15",
  "booking_type": "daily",
  "status": "pending",
  "totalCost": 750
}
Response:
{
  "status": "success",
  "message": "Booking created successfully",
  "data": { "id": 15, "equipment_id": 1, ... }
}
```

### Fetching Customer Bookings
```
GET /agriAPIs/bookings.php?action=read&customer_id=2
Response:
{
  "status": "success",
  "data": [
    {
      "id": 15,
      "equipmentName": "John Deere 5075E",
      "startDate": "2024-02-10",
      "endDate": "2024-02-15",
      "totalCost": 750,
      "status": "pending"
    }
  ]
}
```

---

## 📊 Database Tables & Booking Flow

### bookings Table Structure
```sql
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipment_id INT NOT NULL,          -- Equipment being rented
  customer_id INT NOT NULL,           -- Customer making booking
  start_date DATE NOT NULL,           -- Rental start
  end_date DATE NOT NULL,             -- Rental end
  booking_type ENUM('hourly', 'daily'),
  status ENUM('pending', 'confirmed', 'completed', 'cancelled'),
  totalCost DECIMAL(10, 2),           -- Calculated cost
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Booking Status Flow
```
PENDING
  ↓ (Admin approves)
CONFIRMED
  ↓ (Rental period ends)
COMPLETED
  ↓ (Or customer cancels)
CANCELLED
```

---

## 🔐 Authentication & Authorization

### Login Flow
```
User submits email + password
  ↓
API: users.php?action=login
  ↓
Backend:
  1. Find user by email
  2. Verify password with password_verify()
  3. Check user status is 'active'
  ↓
Return user data if valid:
{
  "id": 2,
  "name": "James Mwangi",
  "email": "james@example.com",
  "role": "customer",
  "status": "active"
}
  ↓
Frontend stores in localStorage
  ↓
AuthContext updates state
  ↓
Route protection redirects to /home (customer) or /dashboard (admin)
```

### Route Protection
```
Customer tries to access /dashboard (admin only)
  ↓
AdminRoute component checks role
  ↓
If role !== 'admin', redirects to /home
  ↓
Admin tries to access /home (customer only)
  ↓
CustomerRoute component checks role
  ↓
If role === 'admin', redirects to /dashboard
```

---

## 🎨 Components Structure

### Customer Portal Components
- **CustomerLayout** - Header with navigation, footer
- **HomePage** - Equipment browsing with filters
- **MyBookingsPage** - Booking history
- **BookingModal** - Date selection & booking form

### Authentication Components
- **LoginPage** - Customer login with admin link
- **AdminLoginPage** - Admin login portal

### Service Layer
```
src/services/
├── apiClient.ts (generic fetch)
├── equipmentService.ts (getEquipment, filters)
├── categoriesService.ts (getCategories)
├── bookingsService.ts (createBooking, getBookings, etc)
├── usersService.ts (loginUser, registerUser)
└── dashboardService.ts (getDashboardStats)
```

---

## 🚀 Deployment Checklist

- ✅ Database created with schema
- ✅ PHP APIs deployed
- ✅ React frontend built
- ✅ Authentication working
- ✅ Equipment browsing operational
- ✅ Booking system functional
- ✅ Error handling implemented
- ✅ Loading states added
- ✅ Role-based access working

---

## 📱 Responsive Design

All pages are fully responsive:
- **Mobile** - Single column, stacked layout
- **Tablet** - 2-column grid
- **Desktop** - 3-column grid and full navigation

---

## 🎉 Features Summary

### For Customers ✅
- [x] Login/Logout
- [x] Browse available equipment
- [x] Search equipment by name
- [x] Filter by category
- [x] View equipment details
- [x] Book equipment with date selection
- [x] Real-time cost calculation
- [x] View booking history
- [x] Cancel pending bookings
- [x] Responsive mobile design

### For Admins ✅
- [x] Login/Logout (separate portal)
- [x] Dashboard with analytics
- [x] Equipment CRUD operations
- [x] Category management
- [x] View all bookings
- [x] Generate reports
- [x] User management

### Technical ✅
- [x] Role-based authentication
- [x] Protected routes
- [x] API integration
- [x] Database persistence
- [x] Error handling
- [x] Loading states
- [x] Toast notifications
- [x] Responsive design

---

## 🔄 Example User Story

**Scenario:** James wants to rent a tractor for 5 days

```
1. James visits website
2. Redirected to /login
3. Logs in with james@example.com / password123
4. Redirected to /home (equipment browsing)
5. Searches for "John Deere" tractor
6. Selects "John Deere 5075E" - $150/day
7. Clicks "Book Now"
8. BookingModal opens
9. Selects:
   - Start date: 2024-02-10
   - End date: 2024-02-15 (5 days)
10. System shows:
    - Duration: 5 days
    - Total cost: $750
11. Clicks "Confirm Booking"
12. API creates booking in database
13. Success notification: "Equipment booked for 5 days. Total: $750.00"
14. Equipment list refreshes
15. James clicks "My Bookings"
16. Sees new booking: Status = Pending, Cost = $750

BOOKING SAVED IN DATABASE:
{
  "id": 15,
  "equipment_id": 1,
  "customer_id": 2,
  "start_date": "2024-02-10",
  "end_date": "2024-02-15",
  "totalCost": 750,
  "status": "pending"
}
```

---

## 📞 Support

For issues or questions:
- Email: support@agrirent.com
- Phone: +255 700 000 000

---

## 🎊 System is Production Ready!

The AgriRent platform is now fully functional with complete customer and admin portals, equipment browsing, booking system, and database integration.
