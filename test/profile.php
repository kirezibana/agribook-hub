<?php
include "config.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {

    $id = intval($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? null;

    if ($id <= 0) {
        sendResponse('error', 'Invalid user ID');
    }

    if (empty($name) || empty($email)) {
        sendResponse('error', 'Name and email are required');
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendResponse('error', 'Invalid email format');
    }

    // Check if email already exists (except current user)
    $check = $conn->prepare("SELECT id FROM users WHERE email=? AND id!=?");
    $check->bind_param("si", $email, $id);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        sendResponse('error', 'Email already in use');
    }
    $check->close();

    // If password provided → hash it
    if (!empty($password)) {

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare(
            "UPDATE users SET name=?, email=?, phone=?, password=? WHERE id=?"
        );
        $stmt->bind_param("ssssi", $name, $email, $phone, $hashedPassword, $id);

    } else {

        $stmt = $conn->prepare(
            "UPDATE users SET name=?, email=?, phone=? WHERE id=?"
        );
        $stmt->bind_param("sssi", $name, $email, $phone, $id);
    }

    if ($stmt->execute()) {

        if ($stmt->affected_rows > 0) {
            sendResponse('success', 'Profile updated successfully');
        } else {
            sendResponse('error', 'No changes made or user not found');
        }

    } else {
        sendResponse('error', $stmt->error);
    }

    $stmt->close();
}

$conn->close();
?>
