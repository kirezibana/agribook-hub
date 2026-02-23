<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get raw input
$payload = file_get_contents("php://input");
$data = json_decode($payload, true);

$logFile = __DIR__ . "/webhook_log.txt";

// Log raw webhook payload
$written = file_put_contents($logFile, $payload . "\n", FILE_APPEND);

// If file write failed, try /tmp as fallback
if ($written === false) {
    $logFile = sys_get_temp_dir() . "/webhook_log.txt";
    file_put_contents($logFile, $payload . "\n", FILE_APPEND);
}

// Make sure we have valid data
if (!$data || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid webhook", "debug" => "No status field found"]);
    exit;
}

$status = strtoupper($data['status']);

// Only proceed if payment successful
if ($status === "SUCCESSFUL" || $status === "SUCCESS") {
    $transactionId = $data['ref'] ?? '';
    $amount        = $data['amount'] ?? 0;
    $phone_number  = $data['phone'] ?? '';
    $bookingId     = $data['metadata']['bookingId'] ?? 0;

    $postData = [
        "bookingId"     => $bookingId,
        "amount"        => $amount,
        "transactionId" => $transactionId,
        "phone_number"  => $phone_number
    ];

<<<<<<< HEAD
    $ch = curl_init("https://app-7d842618-ebdf-4d7a-b855-ec335ee8fdec.cleverapps.io/test/agriAPIs/payment.php");
=======
    // Try to call payment API if it exists
    $paymentApiUrl = "http://localhost/agriAPIs/payment.php";
    $ch = curl_init($paymentApiUrl);
>>>>>>> c939f1484e380f21acd73c000db35329c4623b30
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($postData),
        CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
        CURLOPT_TIMEOUT => 5
    ]);

    $response = curl_exec($ch);
    $curlError = curl_error($ch);
    curl_close($ch);

    // Log API response separately
    file_put_contents($logFile, "API_RESPONSE: " . ($response ?: $curlError) . "\n", FILE_APPEND);
}

http_response_code(200);
echo json_encode([
    "message" => "Webhook received",
    "logged" => $written !== false,
    "logFile" => $logFile
]);
