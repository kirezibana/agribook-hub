<?php
include "config.php";

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse("error", "Invalid request method");
}

$email = trim($_POST['email'] ?? '');
$password = trim($_POST['password'] ?? '');

if (empty($email) || empty($password)) {
    sendResponse("error", "Email and password are required");
}

// Check user
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendResponse("error", "Invalid email or password");
}

$user = $result->fetch_assoc();
$stmt->close();

// Check status
if ($user['status'] !== 'active') {
    sendResponse("error", "Account is deactivated");
}

// Plain password comparison (testing only)
if ($password !== $user['password']) {
    sendResponse("error", "Invalid email or password");
}

// Role-based redirect
if ($user['role'] === 'admin') {
    $redirect = "dashboard.php";
} elseif ($user['role'] === 'customer') {
    $redirect = "home.php";
} else {
    sendResponse("error", "Invalid user role");
}

sendResponse("success", "Login successful", [
    "id" => $user['id'],
    "name" => $user['name'],
    "email" => $user['email'],
    "role" => $user['role'],
    "redirect" => $redirect
]);

$conn->close();
?>
