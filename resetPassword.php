<?php
ini_set('display_errors', 0);
ini_set('html_errors', 0);
error_reporting(E_ALL);

include "config.php";

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
$password = trim($_POST['password'] ?? '');

if (empty($email) || empty($password)) {
    sendResponse("error", "Email and password are required");
}

// Confirm user exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
if (!$stmt) {
    sendResponse("error", "DB prepare failed: " . $conn->error);
}
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    $stmt->close();
    sendResponse("error", "User not found");
}
$stmt->close();

// Update password (plain text per project spec)
$upd = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
if (!$upd) {
    sendResponse("error", "DB prepare failed: " . $conn->error);
}
$upd->bind_param("ss", $password, $email);
if (!$upd->execute()) {
    sendResponse("error", "Failed to update password: " . $upd->error);
}
$upd->close();
$conn->close();

sendResponse("success", "Password updated successfully");
?>
