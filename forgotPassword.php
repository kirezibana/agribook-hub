<?php
// Suppress HTML error output - we always want JSON
ini_set('display_errors', 0);
ini_set('html_errors', 0);
error_reporting(E_ALL);

include "config.php";

// Catch any fatal errors and return JSON
register_shutdown_function(function () {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (!headers_sent()) {
            header('Content-Type: application/json');
        }
        echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $err['message']]);
    }
});

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse("error", "Invalid request method");
}

$email = trim($_POST['email'] ?? '');

if (empty($email)) {
    sendResponse("error", "Email is required");
}

// Auto-create the password reset table if it does not exist
// NOTE: table name uses underscore (tbl_password_reset). Hyphens in MySQL identifiers
// require backticks and cause subtle bugs - underscore is safer.
$createSql = "CREATE TABLE IF NOT EXISTS tbl_password_reset (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    random_number VARCHAR(10) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8";
if (!$conn->query($createSql)) {
    sendResponse("error", "Failed to ensure reset table: " . $conn->error);
}

// Look up user by email
$stmt = $conn->prepare("SELECT id, email, phone FROM users WHERE email = ?");
if (!$stmt) {
    sendResponse("error", "DB prepare failed: " . $conn->error);
}
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    sendResponse("error", "Email not found");
}

$user = $result->fetch_assoc();
$stmt->close();

$phone = $user['phone'] ?? '';
$code = strval(rand(1000, 9999));

// Save into tbl_password_reset
$ins = $conn->prepare("INSERT INTO tbl_password_reset (email, phone, random_number) VALUES (?, ?, ?)");
if (!$ins) {
    sendResponse("error", "DB prepare failed: " . $conn->error);
}
$ins->bind_param("sss", $email, $phone, $code);
if (!$ins->execute()) {
    sendResponse("error", "Failed to save reset request: " . $ins->error);
}
$ins->close();
$conn->close();

sendResponse("success", "Reset code generated", [
    "email" => $email,
    "phone" => $phone,
    "code"  => $code, // returned for demo/test convenience
]);
?>
