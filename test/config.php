<?php
// Database configuration
define('DB_HOST', 'bwuc0if1hswidghp6scb-mysql.services.clever-cloud.com');
define('DB_USER', 'ugiathfymnhzx3is');
define('DB_PASS', 'kjG3Tt9mYi8y8Q2a1gpl');
define('DB_NAME', 'bwuc0if1hswidghp6scb');

// Create connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

// Set charset to utf8
$conn->set_charset("utf8");

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Helper function to send JSON response
function sendResponse($status, $message = '', $data = null) {
    $response = ['status' => $status, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit;
}

// Helper function to get JSON body
function getJsonBody() {
    return json_decode(file_get_contents("php://input"), true);
}
?>
