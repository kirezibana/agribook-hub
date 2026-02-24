<?php
include "config.php";

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

/* ================= CREATE BOOKING ================= */
if ($action === 'create' && $method === 'POST') {
    $data = getJsonBody();
    
    $equipmentId = intval($data['equipmentId'] ?? 0);
    $customerId = intval($data['customerId'] ?? 0);
    $customerName = $data['customerName'] ?? null;
    $customerPhone = $data['customerPhone'] ?? null;
    $customerEmail = $data['customerEmail'] ?? null;
    $startDate = $data['startDate'] ?? null;
    $endDate = $data['endDate'] ?? null;
    $totalDays = intval($data['totalDays'] ?? 0);
    $totalPrice = floatval($data['totalPrice'] ?? 0);
    $status = $data['status'] ?? 'pending';
    $notes = $data['notes'] ?? null;
    
    if (!$equipmentId || !$customerId || !$customerName || !$customerPhone || !$startDate || !$endDate || !$totalDays) {
        sendResponse('error', 'Missing required fields');
    }
    
    // Validate equipment exists
    $eqCheck = $conn->prepare("SELECT id FROM equipment WHERE id = ?");
    $eqCheck->bind_param("i", $equipmentId);
    $eqCheck->execute();
    if ($eqCheck->get_result()->num_rows === 0) {
        sendResponse('error', 'Equipment not found');
    }
    $eqCheck->close();
    
    // Validate customer exists (optional - allow guest bookings)
    // $custCheck = $conn->prepare("SELECT id FROM users WHERE id = ?");
    // $custCheck->bind_param("i", $customerId);
    // $custCheck->execute();
    // if ($custCheck->get_result()->num_rows === 0) {
    //     sendResponse('error', 'Customer not found');
    // }
    // $custCheck->close();
    
    $stmt = $conn->prepare(
        "INSERT INTO bookings (equipmentId, customerId, customerName, customerPhone, customerEmail, 
         startDate, endDate, totalDays, totalPrice, status, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    
    $stmt->bind_param("iisssssidss", $equipmentId, $customerId, $customerName, $customerPhone, 
                     $customerEmail, $startDate, $endDate, $totalDays, $totalPrice, $status, $notes);
    
    if ($stmt->execute()) {
        sendResponse('success', 'Booking created successfully', [
            'id' => $stmt->insert_id,
            'equipmentId' => $equipmentId,
            'customerName' => $customerName
        ]);
    } else {
        sendResponse('error', 'Failed to create booking: ' . $stmt->error);
    }
    $stmt->close();
}

/* ================= READ ALL BOOKINGS ================= */
elseif ($action === 'read' && $method === 'GET') {

    $status = $_GET['status'] ?? null;
    $customerId = isset($_GET['customerId']) ? intval($_GET['customerId']) : null;

    $query = "SELECT 
                b.id, 
                b.equipmentId, 
                e.name AS equipmentName,
                e.categoryId,
                IFNULL(c.name, '') AS categoryName,
                b.customerId, 
                b.customerName, 
                b.customerPhone, 
                b.customerEmail,
                b.startDate, 
                b.endDate, 
                b.totalDays, 
                b.totalPrice, 
                b.status, 
                b.notes, 
                b.createdAt
              FROM bookings b
              LEFT JOIN equipment e ON b.equipmentId = e.id
              LEFT JOIN categories c ON e.categoryId = c.id
              WHERE 1=1";

    $params = [];
    $types = "";

    if ($status !== null) {
        $query .= " AND b.status = ?";
        $params[] = $status;
        $types .= "s";
    }

    if ($customerId !== null) {
        $query .= " AND b.customerId = ?";
        $params[] = $customerId;
        $types .= "i";
    }

    $query .= " ORDER BY b.startDate DESC";

    $stmt = $conn->prepare($query);

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }

    sendResponse('success', '', $bookings);
    $stmt->close();
}


/* ================= DELETE BOOKING ================= */
elseif ($action === 'delete' && $method === 'POST') {
    $data = getJsonBody();
    $id = intval($data['id'] ?? 0);
    
    if ($id <= 0) {
        sendResponse('error', 'Invalid booking ID');
    }
    
    $stmt = $conn->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            sendResponse('success', 'Booking deleted successfully');
        } else {
            sendResponse('error', 'Booking not found');
        }
    } else {
        sendResponse('error', 'Failed to delete booking');
    }
    $stmt->close();
}

else {
    sendResponse('error', 'Invalid action or method');
}

$conn->close();
?>
