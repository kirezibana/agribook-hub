<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$ref = $_GET['ref'] ?? '';

if (!$ref) {
    echo json_encode(["status" => "error", "message" => "No ref provided"]);
    exit;
}

$logFile = __DIR__ . "/webhook_log.txt";

if (!file_exists($logFile)) {
    echo json_encode(["status" => "pending"]);
    exit;
}

$log = file_get_contents($logFile);
$lines = explode(PHP_EOL, trim($log));

// Search from newest to oldest
foreach (array_reverse($lines) as $line) {
    $line = trim($line);
    
    // Skip empty lines and non-JSON lines (like "API RESPONSE: ...")
    if (empty($line) || strpos($line, 'API RESPONSE:') !== false) {
        continue;
    }
    
    $entry = json_decode($line, true);
    
    // Skip if not valid JSON
    if (!$entry || !is_array($entry)) {
        continue;
    }
    
    // Check ref at top level or nested in data
    $entryRef = $entry['ref'] ?? $entry['data']['ref'] ?? null;
    
    if ($entryRef === $ref) {
        // Normalize status to uppercase
        $status = strtoupper($entry['status'] ?? $entry['data']['status'] ?? 'pending');
        echo json_encode(["status" => $status]);
        exit;
    }
}

echo json_encode(["status" => "pending"]);
