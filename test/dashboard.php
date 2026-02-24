<?php
include "config.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get dashboard statistics
    $stats = [];
    
    // Total equipment
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM equipment");
    $stmt->execute();
    $stats['totalEquipment'] = $stmt->get_result()->fetch_assoc()['total'];
    $stmt->close();
    
    // Available equipment
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM equipment WHERE status = 'available'");
    $stmt->execute();
    $stats['availableEquipment'] = $stmt->get_result()->fetch_assoc()['total'];
    $stmt->close();
    
    // Total bookings
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM bookings");
    $stmt->execute();
    $stats['totalBookings'] = $stmt->get_result()->fetch_assoc()['total'];
    $stmt->close();
    
    // Pending bookings
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM bookings WHERE status = 'pending'");
    $stmt->execute();
    $stats['pendingBookings'] = $stmt->get_result()->fetch_assoc()['total'];
    $stmt->close();
    
    // Confirmed bookings
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM bookings WHERE status = 'confirmed'");
    $stmt->execute();
    $stats['confirmedBookings'] = $stmt->get_result()->fetch_assoc()['total'];
    $stmt->close();
    
    // Total revenue
    $stmt = $conn->prepare("SELECT COALESCE(SUM(totalPrice), 0) as total FROM bookings WHERE status IN ('completed', 'confirmed')");
    $stmt->execute();
    $stats['totalRevenue'] = floatval($stmt->get_result()->fetch_assoc()['total']);
    $stmt->close();
    
    // Completed bookings
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM bookings WHERE status = 'completed'");
    $stmt->execute();
    $stats['completedBookings'] = $stmt->get_result()->fetch_assoc()['total'];
    $stmt->close();
    
    // Total customers
    $stmt = $conn->prepare("SELECT COUNT(DISTINCT customerId) as total FROM bookings");
    $stmt->execute();
    $stats['totalCustomers'] = $stmt->get_result()->fetch_assoc()['total'];
    $stmt->close();
    
    // Total categories
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM categories");
    $stmt->execute();
    $stats['totalCategories'] = $stmt->get_result()->fetch_assoc()['total'];
    $stmt->close();
    
    // Recent bookings (last 5)
    $stmt = $conn->prepare(
        "SELECT b.id, b.equipmentId, e.name as equipmentName, b.customerName, 
         b.totalPrice, b.status, b.createdAt 
         FROM bookings b 
         LEFT JOIN equipment e ON b.equipmentId = e.id 
         ORDER BY b.createdAt DESC LIMIT 5"
    );
    $stmt->execute();
    $result = $stmt->get_result();
    $recentBookings = [];
    while ($row = $result->fetch_assoc()) {
        $recentBookings[] = $row;
    }
    $stats['recentBookings'] = $recentBookings;
    $stmt->close();
    
    // Equipment usage stats
    $stmt = $conn->prepare(
        "SELECT e.id, e.name, COUNT(b.id) as bookingCount 
         FROM equipment e 
         LEFT JOIN bookings b ON e.id = b.equipmentId 
         GROUP BY e.id, e.name 
         ORDER BY bookingCount DESC 
         LIMIT 10"
    );
    $stmt->execute();
    $result = $stmt->get_result();
    $equipmentStats = [];
    while ($row = $result->fetch_assoc()) {
        $equipmentStats[] = $row;
    }
    $stats['equipmentStats'] = $equipmentStats;
    $stmt->close();
    
    // Monthly booking trends (last 6 months)
    $monthlyTrends = [];
    $stmt = $conn->prepare(
        "SELECT 
            DATE_FORMAT(createdAt, '%b') as monthName,
            COUNT(*) as bookings,
            COALESCE(SUM(totalPrice), 0) as revenue
         FROM bookings
         WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
         GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
         ORDER BY DATE_FORMAT(createdAt, '%Y-%m') ASC"
    );
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $monthlyTrends[] = [
            'name' => $row['monthName'],
            'bookings' => intval($row['bookings']),
            'revenue' => floatval($row['revenue'])
        ];
    }
    $stats['monthlyTrends'] = $monthlyTrends;
    $stmt->close();
    
    // Category statistics
    $categoryStats = [];
    $stmt = $conn->prepare(
        "SELECT c.name, COUNT(e.id) as equipmentCount
         FROM categories c
         LEFT JOIN equipment e ON c.id = e.categoryId
         GROUP BY c.id, c.name
         ORDER BY equipmentCount DESC"
    );
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $categoryStats[] = [
            'name' => $row['name'],
            'value' => intval($row['equipmentCount'])
        ];
    }
    $stats['categoryStats'] = $categoryStats;
    $stmt->close();
    
    sendResponse('success', '', $stats);
} else {
    sendResponse('error', 'Invalid method');
}

$conn->close();
?>
