<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Sample user data for testing
$valid_users = [
    [
        'id' => 1,
        'name' => 'Admin User',
        'email' => 'admin@agribook.com',
        'password' => 'admin123', // Plain text for testing
        'role' => 'admin'
    ],
    [
        'id' => 2,
        'name' => 'Customer User',
        'email' => 'james@example.com',
        'password' => 'password123', // Plain text for testing
        'role' => 'customer'
    ]
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    
    // Find user by email
    $user = null;
    foreach ($valid_users as $u) {
        if ($u['email'] === $email) {
            $user = $u;
            break;
        }
    }
    
    // Validate credentials
    if ($user && $user['password'] === $password) {
        // Return success response with user data
        echo json_encode([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'redirect' => 'dashboard.php'
            ]
        ]);
    } else {
        // Return error response
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid email or password'
        ]);
    }
} else {
    // Return error for non-POST requests
    echo json_encode([
        'status' => 'error',
        'message' => 'Only POST requests allowed'
    ]);
}
?>