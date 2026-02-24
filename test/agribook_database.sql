-- Agribook Hub Database Schema
-- Equipment Booking Management System

-- Create Database
CREATE DATABASE IF NOT EXISTS agribook_hub;
USE agribook_hub;

-- Users/Admins Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'customer') DEFAULT 'customer',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    modelNumber VARCHAR(100) NOT NULL UNIQUE,
    categoryId INT NOT NULL,
    pricePerDay DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image LONGTEXT,
    status ENUM('available', 'booked', 'maintenance', 'retired') DEFAULT 'available',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_categoryId (categoryId),
    INDEX idx_status (status),
    INDEX idx_modelNumber (modelNumber)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipmentId INT NOT NULL,
    customerId INT NOT NULL,
    customerName VARCHAR(255) NOT NULL,
    customerPhone VARCHAR(20) NOT NULL,
    customerEmail VARCHAR(255),
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    totalDays INT NOT NULL,
    totalPrice DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipmentId) REFERENCES equipment(id) ON DELETE CASCADE,
    FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_equipmentId (equipmentId),
    INDEX idx_customerId (customerId),
    INDEX idx_status (status),
    INDEX idx_startDate (startDate),
    INDEX idx_endDate (endDate)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bookingId INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    paymentMethod ENUM('cash', 'mpesa', 'bank_transfer', 'credit_card', 'cheque') DEFAULT 'cash',
    transactionId VARCHAR(100),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    paidAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_bookingId (bookingId),
    INDEX idx_status (status)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bookingId INT NOT NULL,
    customerId INT NOT NULL,
    equipmentId INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (equipmentId) REFERENCES equipment(id) ON DELETE CASCADE,
    INDEX idx_bookingId (bookingId),
    INDEX idx_equipmentId (equipmentId),
    UNIQUE KEY unique_booking_review (bookingId)
);

-- Equipment Maintenance Log Table
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipmentId INT NOT NULL,
    maintenanceType VARCHAR(100) NOT NULL,
    description TEXT,
    startDate DATE NOT NULL,
    endDate DATE,
    cost DECIMAL(10, 2),
    status ENUM('scheduled', 'in_progress', 'completed') DEFAULT 'scheduled',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipmentId) REFERENCES equipment(id) ON DELETE CASCADE,
    INDEX idx_equipmentId (equipmentId),
    INDEX idx_status (status)
);

-- Insert Sample Categories
INSERT INTO categories (name, description) VALUES
('Tractors', 'Heavy-duty farming tractors'),
('Harvesters', 'Crop harvesting machines'),
('Seeders', 'Planting and seeding equipment'),
('Irrigation', 'Water management systems'),
('Tillers', 'Soil preparation machinery');

-- Insert Sample Equipment
INSERT INTO equipment (name, modelNumber, categoryId, pricePerDay, description, image, status) VALUES
('John Deere 5075E', 'JD-5075E', 1, 150.00, '75 HP utility tractor perfect for medium farms', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400', 'available'),
('Kubota M7-172', 'KM7-172', 1, 200.00, '172 HP premium tractor with advanced features', 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=400', 'booked'),
('Case IH Axial-Flow', 'CI-AF8250', 2, 350.00, 'High-capacity combine harvester', 'https://images.unsplash.com/photo-1500437386664-56d1dfef3854?w=400', 'available'),
('Great Plains 3S-4000', 'GP-3S4000', 3, 120.00, '40-foot grain drill for efficient seeding', 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400', 'available'),
('Valley Center Pivot', 'VC-8000', 4, 80.00, 'Center pivot irrigation system', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', 'maintenance'),
('Honda FG110', 'HFG-110', 5, 45.00, 'Mini tiller for small gardens', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400', 'available');

-- Insert Sample Users (Admin + Customers)
INSERT INTO users (name, email, password, phone, role, status) VALUES
('Admin User', 'admin@agribook.com', 'admin123', '+255 700 000 000', 'admin', 'active'),
('James Mwangi', 'james@example.com', 'pass123', '+255 712 345 678', 'customer', 'active'),
('Sarah Okonkwo', 'sarah@example.com', 'pass123', '+255 723 456 789', 'customer', 'active'),
('Emmanuel Banda', 'emmanuel@example.com', 'pass123', '+255 734 567 890', 'customer', 'active'),
('Grace Kimani', 'grace@example.com', 'pass123', '+255 745 678 901', 'customer', 'active'),
('Peter Mutua', 'peter@example.com', 'pass123', '+255 756 789 012', 'customer', 'active'),
('Alice Wanjiku', 'alice@example.com', 'pass123', '+255 767 890 123', 'customer', 'active');

-- Insert Sample Bookings
INSERT INTO bookings (equipmentId, customerId, customerName, customerPhone, customerEmail, startDate, endDate, totalDays, totalPrice, status, notes) VALUES
(1, 2, 'James Mwangi', '+255 712 345 678', 'james@example.com', '2024-03-01', '2024-03-05', 5, 750.00, 'completed', 'Planted corn on 50 acres'),
(2, 3, 'Sarah Okonkwo', '+255 723 456 789', 'sarah@example.com', '2024-03-10', '2024-03-15', 6, 1200.00, 'confirmed', 'Harvest preparation'),
(3, 4, 'Emmanuel Banda', '+255 734 567 890', 'emmanuel@example.com', '2024-03-20', '2024-03-25', 6, 2100.00, 'pending', 'Harvest maize'),
(4, 5, 'Grace Kimani', '+255 745 678 901', 'grace@example.com', '2024-03-12', '2024-03-14', 3, 360.00, 'confirmed', 'Plant wheat'),
(6, 6, 'Peter Mutua', '+255 756 789 012', 'peter@example.com', '2024-03-08', '2024-03-10', 3, 135.00, 'completed', 'Garden tilling'),
(1, 7, 'Alice Wanjiku', '+255 767 890 123', 'alice@example.com', '2024-03-25', '2024-03-30', 6, 900.00, 'pending', 'Spring plowing');

-- Insert Sample Payments
INSERT INTO payments (bookingId, amount, paymentMethod, status) VALUES
(1, 750.00, 'cash', 'completed'),
(2, 1200.00, 'mpesa', 'completed'),
(4, 360.00, 'bank_transfer', 'completed'),
(5, 135.00, 'cash', 'completed');

-- Insert Sample Reviews
INSERT INTO reviews (bookingId, customerId, equipmentId, rating, comment) VALUES
(1, 2, 1, 5, 'Excellent tractor! Very reliable and easy to operate.'),
(5, 6, 6, 4, 'Good quality tiller, very efficient for my garden.');
