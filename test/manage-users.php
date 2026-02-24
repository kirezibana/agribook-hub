<?php
require_once "config.php";

$method = $_SERVER['REQUEST_METHOD'];

// ================= CREATE USER =================
if ($method == "POST") {

    $input = json_decode(file_get_contents("php://input"), true);

    $name     = $conn->real_escape_string($input['name']);
    $email    = $conn->real_escape_string($input['email']);
    $password = $conn->real_escape_string($input['password']);
    $phone    = $conn->real_escape_string($input['phone']);
    $role     = $conn->real_escape_string($input['role']);

    $sql = "INSERT INTO users (name,email,password,phone,role) 
            VALUES ('$name','$email','$password','$phone','$role')";

    if ($conn->query($sql)) {
        sendResponse(true, "User created successfully");
    } else {
        sendResponse(false, "Failed to create user");
    }
}


// ================= READ ALL USERS =================
elseif ($method == "GET" && !isset($_GET['id'])) {

    $result = $conn->query("SELECT * FROM users");

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }

    sendResponse(true, "Users fetched", $users);
}


// ================= READ SINGLE USER =================
elseif ($method == "GET" && isset($_GET['id'])) {

    $id = intval($_GET['id']);

    $result = $conn->query("SELECT * FROM users WHERE id=$id");

    if ($result->num_rows > 0) {
        sendResponse(true, "User found", $result->fetch_assoc());
    } else {
        sendResponse(false, "User not found");
    }
}


// ================= UPDATE USER =================
elseif ($method == "PUT") {

    $input = json_decode(file_get_contents("php://input"), true);

    $id       = intval($input['id']);
    $name     = $conn->real_escape_string($input['name']);
    $email    = $conn->real_escape_string($input['email']);
    $password = $conn->real_escape_string($input['password']);
    $phone    = $conn->real_escape_string($input['phone']);
    $role     = $conn->real_escape_string($input['role']);
    $status   = $conn->real_escape_string($input['status']);

    $sql = "UPDATE users 
            SET name='$name',
                email='$email',
                password='$password',
                phone='$phone',
                role='$role',
                status='$status'
            WHERE id=$id";

    if ($conn->query($sql)) {
        sendResponse(true, "User updated successfully");
    } else {
        sendResponse(false, "Failed to update user");
    }
}


// ================= DELETE USER =================
elseif ($method == "DELETE") {

    $id = intval($_GET['id']);

    $sql = "DELETE FROM users WHERE id=$id";

    if ($conn->query($sql)) {
        sendResponse(true, "User deleted successfully");
    } else {
        sendResponse(false, "Failed to delete user");
    }
}

else {
    sendResponse(false, "Invalid request method");
}
?>
 