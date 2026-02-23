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

// Check both possible log file locations
$logFiles = [
    __DIR__ . "/webhook_log.txt",
    sys_get_temp_dir() . "/webhook_log.txt"
];

foreach ($logFiles as $logFile) {
    if (!file_exists($logFile)) {
        continue;
    }

    $log = file_get_contents($logFile);
    if ($log === false) {
        continue;
    }

    $lines = explode("\n", trim($log));

    // Search from newest to oldest
    foreach (array_reverse($lines) as $line) {
        $line = trim($line);

        // Skip empty lines and non-JSON lines
        if (empty($line) || $line[0] !== '{') {
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
            echo json_encode(["status" => $status, "source" => "log"]);
            exit;
        }
    }
}

echo json_encode(["status" => "pending", "debug" => "ref not found in logs"]);
