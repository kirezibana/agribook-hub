<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "config.php"; // <-- your DB connection

$payload = file_get_contents("php://input");
$data = json_decode($payload, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid JSON"]);
    exit;
}

/*
   Handle both:
   1. { status: "...", ref: "..." }
   2. { data: { status: "...", ref: "..." } }
*/

$status = strtoupper($data['status'] ?? $data['data']['status'] ?? '');
$ref    = $data['ref'] ?? $data['data']['ref'] ?? '';
$amount = $data['amount'] ?? $data['data']['amount'] ?? 0;
$phone  = $data['phone'] ?? $data['data']['phone'] ?? '';

if (!$status || !$ref) {
    http_response_code(400);
    echo json_encode(["message" => "Missing ref or status"]);
    exit;
}

/* 
   Insert or update payment record
   (prevents duplicates if webhook fires twice)
*/

$stmt = $conn->prepare("
    INSERT INTO payments (ref, status, amount, phone)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        amount = VALUES(amount),
        phone  = VALUES(phone)
");

$stmt->bind_param("ssds", $ref, $status, $amount, $phone);
$stmt->execute();

$stmt->close();

http_response_code(200);
echo json_encode([
    "message" => "Webhook stored",
    "ref" => $ref,
    "status" => $status
]);
error_log("WEBHOOK REF: " . $ref);