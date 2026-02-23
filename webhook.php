<?php
header("Content-Type: application/json");

// Get raw input
$payload = file_get_contents("php://input");
$data = json_decode($payload, true);

// Log webhook for debugging - write the raw JSON on one line
file_put_contents(__DIR__ . "/webhook_log.txt", $payload . PHP_EOL, FILE_APPEND);

// Make sure we have valid data
if (!$data || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid webhook"]);
    exit;
}

$status = strtoupper($data['status']);

// Only proceed if payment successful
if ($status === "SUCCESSFUL") {
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

    $ch = curl_init("https://app-7d842618-ebdf-4d7a-b855-ec335ee8fdec.cleverapps.io/test/agriAPIs/payment.php");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($postData),
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json"
        ]
    ]);

    $response = curl_exec($ch);

    // Log API response on a separate clearly-marked line (won't be parsed as webhook data)
    file_put_contents(__DIR__ . "/webhook_log.txt", "API RESPONSE: " . $response . PHP_EOL, FILE_APPEND);

    curl_close($ch);
}

http_response_code(200);
echo json_encode(["message" => "Webhook received"]);
