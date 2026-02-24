<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "config.php"; // <-- your DB connection

$ref = $_GET['ref'] ?? '';

if (!$ref) {
    echo json_encode(["status" => "error", "message" => "No ref provided"]);
    exit;
}

$stmt = $conn->prepare("SELECT status FROM payments WHERE ref = ? LIMIT 1");
$stmt->bind_param("s", $ref);
$stmt->execute();

$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode([
        "status" => strtoupper($row['status']),
        "source" => "database"
    ]);
} else {
    echo json_encode(["status" => "pending"]);
}

$stmt->close();