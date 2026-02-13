# AgriRent System - Customer Portal & Expanded Features

## 🎉 New Features Implemented

### 1. **Customer Home Page (HomePage.tsx)**
- Browse available equipment with advanced filtering
- Search equipment by name
- Filter by category
- View equipment details:
  - Daily rental rates
  - Equipment status (Available/Unavailable)
  - Booking count and ratings
  - High-quality images with hover effects
- Real-time equipment availability (only shows available items)

### 2. **Equipment Booking System**
- **BookingModal Component** - Professional booking interface
- Date range selection with validation:
  - Prevents booking in the past
  - Prevents end date before start date
  - Auto-calculates rental duration
- Real-time price calculation
- Automatic total cost computation based on:
  - Daily rate × Number of days
- Direct integration with booking API
- Success notifications with booking confirmation
- Bookings saved directly to database

### 3. **Role-Based Routing**
**Admin Access:**
- `/admin-login` - Admin login portal
- `/dashboard` - Analytics dashboard
- `/categories` - Category management
- `/equipment` - Equipment management
- `/bookings` - Booking management
- `/reports` - Reports and analytics

**Customer Access:**
- `/login` - Customer login
- `/home` - Equipment browsing and booking

### 4. **Separate Login Pages**
- **LoginPage** - Customer login with link to admin portal
- **AdminLoginPage** - Dedicated admin login with back button
- Clear separation of concerns
- Role-based redirection

### 5. **Customer Layout (CustomerLayout.tsx)**
Professional customer-facing interface with:
- Clean header with logo and branding
- User profile display
- Logout button
- Equipment browsing navigation
- Professional footer with contact info
- Responsive design (mobile & desktop)

---

## 🔄 Database Integration

### Bookings Flow
```
Customer selects equipment
    ↓
Opens booking modal
    ↓
Selects start and end dates
    ↓
System calculates total cost
    ↓
Clicks "Confirm Booking"
    ↓
API creates booking record in 'bookings' table
    ↓
Equipment availability is updated (if implemented)
    ↓
Success notification shown
    ↓
Equipment list refreshed
```

### Booking Data Saved
```sql
INSERT INTO bookings (
  equipment_id,
  customer_id,
  start_date,
  end_date,
  booking_type,
  status,
  totalCost,
  createdAt
) VALUES (...)
```

---

## 📱 File Structure

```
src/
├── pages/
│   ├── HomePage.tsx (NEW - Customer equipment browsing)
│   ├── AdminLoginPage.tsx (NEW - Admin login portal)
│   ├── LoginPage.tsx (UPDATED - Added admin link)
│   └── ... (other admin pages)
├── components/
│   ├── layout/
│   │   └── CustomerLayout.tsx (NEW - Customer navigation layout)
│   │   └── AdminLayout.tsx (existing - Admin layout)
│   └── dialogs/
│       └── BookingModal.tsx (NEW - Booking interface)
├── contexts/
│   └── AuthContext.tsx (UPDATED - Role-based auth)
└── App.tsx (UPDATED - New routing structure)
```

---

## 🚀 How It Works

### For Customers:
1. **Visit `/login`** - Customer login page
2. **Click "Go to Admin Portal"** - To switch to admin login
3. **Login with:** `james@example.com` / `password123`
4. **Browse Equipment** - Automatically redirected to `/home`
5. **Filter & Search** - Find equipment by name or category
6. **Book Equipment** - Click "Book Now" button
7. **Select Dates** - Choose start and end dates
8. **Confirm** - System calculates cost and saves booking
9. **Success!** - Booking appears in database immediately

### For Admin:
1. **Visit `/login`** - Customer login page
2. **Click "Go to Admin Portal"** - Go to admin login
3. **Login with:** `admin@agribook.com` / `admin123`
4. **Manage System** - Access dashboard, equipment, bookings, etc.

---

## 🔐 Security Features

✅ **Role-Based Access Control**
- Customers cannot access admin pages
- Admins cannot access customer pages
- Automatic redirection based on role

✅ **Protected Routes**
- `/dashboard` requires admin role
- `/home` requires customer role
- Unauthenticated users redirected to `/login`

✅ **User Session Management**
- Session stored in localStorage
- User data persisted across page refreshes
- Logout clears all session data

---

## 🎯 Booking Features

### Smart Validation
- ✅ Prevents dates in the past
- ✅ Prevents end date before start date
- ✅ Requires both dates selected
- ✅ Shows error messages for invalid inputs

### Real-Time Calculation
- Auto-calculates duration in days
- Real-time total cost display
- Updates as dates change

### Direct Database Integration
- Bookings saved to `bookings` table
- Includes:
  - Equipment ID
  - Customer ID
  - Start and end dates
  - Booking type (daily)
  - Status (pending)
  - Total cost
  - Timestamp

---

## 📊 Demo Credentials

### Customer Account
- Email: `james@example.com`
- Password: `password123`
- Accesses: `/home` (equipment browsing)

### Admin Account
- Email: `admin@agribook.com`
- Password: `admin123`
- Accesses: `/dashboard`, `/equipment`, `/bookings`, etc.

---

## ✨ Technical Highlights

- **Real-time Equipment Status** - Only available equipment shown to customers
- **Automatic Equipment Refresh** - List refreshes after successful booking
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Error Handling** - Graceful error messages and retry options
- **Loading States** - Skeleton loaders while fetching data
- **API Integration** - Direct integration with backend APIs
- **Date Validation** - Client-side and server-side validation

---

## 🔄 Next Steps (Optional Enhancements)

1. **Booking Confirmation Email** - Send confirmation to customer
2. **Equipment Unavailability** - Mark equipment as unavailable during booked periods
3. **Payment Integration** - Add payment processing
4. **Booking History** - Customer dashboard showing past/upcoming bookings
5. **Equipment Reviews** - Allow customers to rate equipment
6. **Cancellation Policy** - Allow customers to cancel bookings
7. **Admin Approval** - Require admin to approve bookings before confirmation

---

## 🎉 System is Ready!

The AgriRent platform now has:
✅ Customer portal with equipment browsing
✅ Advanced filtering and search
✅ Complete booking system
✅ Role-based access control
✅ Admin and customer login portals
✅ Real-time database integration
✅ Professional UI/UX design
✅ Responsive mobile-friendly layout

**Customers can now browse equipment and book it directly!**
