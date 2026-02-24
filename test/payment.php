<?php
require_once "config.php";

$method = $_SERVER['REQUEST_METHOD'];

/* ================================
   READ (GET)
================================ */
if ($method === 'GET') {

    if (isset($_GET['id'])) {

        $id = intval($_GET['id']);
        $result = $conn->query("SELECT * FROM payments WHERE id = $id");

        if ($result && $result->num_rows > 0) {
            sendResponse("success", "Payment found", $result->fetch_assoc());
        } else {
            sendResponse("error", "Payment not found");
        }

    } else {

        $result = $conn->query("SELECT * FROM payments ORDER BY id DESC");
        $payments = [];

        while ($row = $result->fetch_assoc()) {
            $payments[] = $row;
        }

        sendResponse("success", "All payments", $payments);
    }
}


/* ================================
   CREATE (POST)
================================ */
elseif ($method === 'POST') {

    $data = getJsonBody();

    if (
        empty($data['bookingId']) ||
        empty($data['amount']) ||
        empty($data['transactionId']) ||
        empty($data['phone_number'])
    ) {
        sendResponse("error", "All fields are required");
    }

    $bookingId     = intval($data['bookingId']);
    $amount        = floatval($data['amount']);
    $transactionId = $conn->real_escape_string($data['transactionId']);
    $phone_number  = $conn->real_escape_string($data['phone_number']);

    $sql = "INSERT INTO payments 
            (bookingId, amount, transactionId, phone_number, createdAt, updatedAt)
            VALUES 
            ($bookingId, $amount, '$transactionId', '$phone_number', NOW(), NOW())";

    if ($conn->query($sql)) {
        sendResponse("success", "Payment created", [
            "id" => $conn->insert_id
        ]);
    } else {
        sendResponse("error", $conn->error);
    }
}


/* ================================
   UPDATE (PUT)
================================ */
elseif ($method === 'PUT') {

    if (!isset($_GET['id'])) {
        sendResponse("error", "ID is required");
    }

    $id = intval($_GET['id']);
    $data = getJsonBody();

    $bookingId     = intval($data['bookingId']);
    $amount        = floatval($data['amount']);
    $transactionId = $conn->real_escape_string($data['transactionId']);
    $phone_number  = $conn->real_escape_string($data['phone_number']);

    $sql = "UPDATE payments SET
            bookingId = $bookingId,
            amount = $amount,
            transactionId = '$transactionId',
            phone_number = '$phone_number',
            updatedAt = NOW()
            WHERE id = $id";

    if ($conn->query($sql)) {
        sendResponse("success", "Payment updated");
    } else {
        sendResponse("error", $conn->error);
    }
}


/* ================================
   DELETE (DELETE)
================================ */
elseif ($method === 'DELETE') {

    if (!isset($_GET['id'])) {
        sendResponse("error", "ID is required");
    }

    $id = intval($_GET['id']);

    if ($conn->query("DELETE FROM payments WHERE id = $id")) {
        sendResponse("success", "Payment deleted");
    } else {
        sendResponse("error", $conn->error);
    }
}


/* ================================
   INVALID METHOD
================================ */
else {
    sendResponse("error", "Invalid request method");
}
