<?php
include "config.php";

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

/* ================= CREATE USER ================= */
if ($action === 'create' && $method === 'POST') {
    $data = getJsonBody();
    
    $name = $data['name'] ?? null;
    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;
    $phone = $data['phone'] ?? null;
    $role = $data['role'] ?? 'customer';
    
    if (!$name || !$email || !$password) {
        sendResponse('error', 'Name, email, and password are required');
    }
    
    // Check if email exists
    $checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    if ($checkStmt->get_result()->num_rows > 0) {
        sendResponse('error', 'Email already exists');
    }
    $checkStmt->close();
    
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    
    $stmt = $conn->prepare(
        "INSERT INTO users (name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, 'active')"
    );
    $stmt->bind_param("sssss", $name, $email, $hashedPassword, $phone, $role);
    
    if ($stmt->execute()) {
        sendResponse('success', 'User created successfully', [
            'id' => $stmt->insert_id,
            'name' => $name,
            'email' => $email,
            'role' => $role
        ]);
    } else {
        sendResponse('error', 'Failed to create user: ' . $stmt->error);
    }
    $stmt->close();
}

/* ================= LOGIN ================= */
elseif ($action === 'login' && $method === 'POST') {
    $data = getJsonBody();
    
    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;
    
    if (!$email || !$password) {
        sendResponse('error', 'Email and password are required');
    }
    
    $stmt = $conn->prepare("SELECT id, name, email, password, role, status FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendResponse('error', 'Invalid email or password');
    }
    
    $user = $result->fetch_assoc();
    
    if (!password_verify($password, $user['password'])) {
        sendResponse('error', 'Invalid email or password');
    }
    
    if ($user['status'] !== 'active') {
        sendResponse('error', 'User account is not active');
    }
    
    // Return user without password
    unset($user['password']);
    sendResponse('success', 'Login successful', $user);
    $stmt->close();
}

/* ================= READ ALL USERS ================= */
elseif ($action === 'read' && $method === 'GET') {
    $role = $_GET['role'] ?? null;
    $status = $_GET['status'] ?? null;
    
    $query = "SELECT id, name, email, phone, role, status, createdAt FROM users WHERE 1=1";
    $params = [];
    $types = "";
    
    if ($role !== null) {
        $query .= " AND role = ?";
        $params[] = $role;
        $types .= "s";
    }
    
    if ($status !== null) {
        $query .= " AND status = ?";
        $params[] = $status;
        $types .= "s";
    }
    
    $query .= " ORDER BY createdAt DESC";
    
    $stmt = $conn->prepare($query);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $users = [];
    
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    
    sendResponse('success', '', $users);
    $stmt->close();
}

/* ================= READ SINGLE USER ================= */
elseif ($action === 'read_one' && $method === 'GET') {
    $id = intval($_GET['id'] ?? 0);
    
    if ($id <= 0) {
        sendResponse('error', 'Invalid user ID');
    }
    
    $stmt = $conn->prepare("SELECT id, name, email, phone, role, status, createdAt FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        sendResponse('success', '', $result->fetch_assoc());
    } else {
        sendResponse('error', 'User not found');
    }
    $stmt->close();
}

/* ================= UPDATE USER ================= */
elseif ($action === 'update' && $method === 'POST') {
    $data = getJsonBody();
    
    $id = intval($data['id'] ?? 0);
    if ($id <= 0) {
        sendResponse('error', 'Invalid user ID');
    }
    
    $fields = [];
    $params = [];
    $types = "";
    
    if (isset($data['name'])) {
        $fields[] = "name = ?";
        $params[] = $data['name'];
        $types .= "s";
    }
    
    if (isset($data['email'])) {
        $fields[] = "email = ?";
        $params[] = $data['email'];
        $types .= "s";
    }
    
    if (isset($data['phone'])) {
        $fields[] = "phone = ?";
        $params[] = $data['phone'];
        $types .= "s";
    }
    
    if (isset($data['role'])) {
        $fields[] = "role = ?";
        $params[] = $data['role'];
        $types .= "s";
    }
    
    if (isset($data['status'])) {
        $fields[] = "status = ?";
        $params[] = $data['status'];
        $types .= "s";
    }
    
    if (isset($data['password']) && !empty($data['password'])) {
        $fields[] = "password = ?";
        $params[] = password_hash($data['password'], PASSWORD_BCRYPT);
        $types .= "s";
    }
    
    if (empty($fields)) {
        sendResponse('error', 'No fields provided for update');
    }
    
    $params[] = $id;
    $types .= "i";
    
    $query = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            sendResponse('success', 'User updated successfully');
        } else {
            sendResponse('error', 'User not found');
        }
    } else {
        sendResponse('error', 'Failed to update user: ' . $stmt->error);
    }
    $stmt->close();
}

/* ================= DELETE USER ================= */
elseif ($action === 'delete' && $method === 'POST') {
    $data = getJsonBody();
    $id = intval($data['id'] ?? 0);
    
    if ($id <= 0) {
        sendResponse('error', 'Invalid user ID');
    }
    
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            sendResponse('success', 'User deleted successfully');
        } else {
            sendResponse('error', 'User not found');
        }
    } else {
        sendResponse('error', 'Failed to delete user');
    }
    $stmt->close();
}

else {
    sendResponse('error', 'Invalid action or method');
}

$conn->close();
?>
