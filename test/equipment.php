<?php
include "config.php";

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

/* ================= CREATE ================= */
if ($action === 'create' && $method === 'POST') {

    $name = $_POST['name'] ?? null;
    $modelNumber = $_POST['modelNumber'] ?? null;
    $categoryId = intval($_POST['categoryId'] ?? 0);
    $pricePerDay = floatval($_POST['pricePerDay'] ?? 0);
    $description = $_POST['description'] ?? null;
    $status = $_POST['status'] ?? 'available';

    if (!$name || !$modelNumber || $categoryId <= 0 || $pricePerDay <= 0) {
        sendResponse('error', 'Missing required fields');
    }

    // Check category
    $check = $conn->prepare("SELECT id FROM categories WHERE id=?");
    $check->bind_param("i", $categoryId);
    $check->execute();
    if ($check->get_result()->num_rows === 0) {
        sendResponse('error', 'Category not found');
    }
    $check->close();

    // Insert without image first
    $stmt = $conn->prepare(
        "INSERT INTO equipment (name, modelNumber, categoryId, pricePerDay, description, status)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("ssidss", $name, $modelNumber, $categoryId, $pricePerDay, $description, $status);

    if (!$stmt->execute()) {
        sendResponse('error', $stmt->error);
    }

    $id = $stmt->insert_id;
    $stmt->close();

    $imagePath = null;

    if (!empty($_FILES['image']['name'])) {

        $allowed = ['jpg','jpeg','png','gif'];
        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));

        if (!in_array($ext, $allowed)) {
            sendResponse('error', 'Invalid image type');
        }

        if ($_FILES['image']['size'] > 2 * 1024 * 1024) {
            sendResponse('error', 'Image too large (max 2MB)');
        }

        $uploadDir = "images/";
        if (!is_dir($uploadDir)) mkdir($uploadDir);

        $fileName = "equipment_" . $id . "." . $ext;
        $fullPath = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $fullPath)) {

            $up = $conn->prepare("UPDATE equipment SET image=? WHERE id=?");
            $up->bind_param("si", $fullPath, $id);
            $up->execute();
            $up->close();

            $imagePath = $fullPath;
        }
    }

    sendResponse('success', 'Created successfully', [
        'id' => $id,
        'image' => $imagePath
    ]);
}


/* ================= READ ALL ================= */
elseif ($action === 'read' && $method === 'GET') {

    $result = $conn->query(
        "SELECT e.*, c.name AS categoryName
         FROM equipment e
         LEFT JOIN categories c ON e.categoryId=c.id
         ORDER BY e.id DESC"
    );

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    sendResponse('success', '', $data);
}


/* ================= READ ONE ================= */
elseif ($action === 'read_one' && $method === 'GET') {

    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0) sendResponse('error', 'Invalid ID');

    $stmt = $conn->prepare(
        "SELECT e.*, c.name AS categoryName
         FROM equipment e
         LEFT JOIN categories c ON e.categoryId=c.id
         WHERE e.id=?"
    );
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows === 0) {
        sendResponse('error', 'Not found');
    }

    sendResponse('success', '', $res->fetch_assoc());
}


/* ================= UPDATE ================= */
elseif ($action === 'update' && $method === 'POST') {

    $id = intval($_POST['id'] ?? 0);
    if ($id <= 0) sendResponse('error', 'Invalid ID');

    $name = $_POST['name'] ?? null;
    $modelNumber = $_POST['modelNumber'] ?? null;
    $categoryId = intval($_POST['categoryId'] ?? 0);
    $pricePerDay = floatval($_POST['pricePerDay'] ?? 0);
    $description = $_POST['description'] ?? null;
    $status = $_POST['status'] ?? null;

    $stmt = $conn->prepare(
        "UPDATE equipment 
         SET name=?, modelNumber=?, categoryId=?, pricePerDay=?, description=?, status=?
         WHERE id=?"
    );
    $stmt->bind_param("ssidssi", $name, $modelNumber, $categoryId, $pricePerDay, $description, $status, $id);

    if (!$stmt->execute()) {
        sendResponse('error', $stmt->error);
    }
    $stmt->close();

    // Image update
    if (!empty($_FILES['image']['name'])) {

        // Get old image
        $old = $conn->query("SELECT image FROM equipment WHERE id=$id")->fetch_assoc();
        if (!empty($old['image']) && file_exists($old['image'])) {
            unlink($old['image']);
        }

        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $fileName = "equipment_" . $id . "." . $ext;
        $fullPath = "images/" . $fileName;

        move_uploaded_file($_FILES['image']['tmp_name'], $fullPath);

        $img = $conn->prepare("UPDATE equipment SET image=? WHERE id=?");
        $img->bind_param("si", $fullPath, $id);
        $img->execute();
        $img->close();
    }

    sendResponse('success', 'Updated successfully');
}


/* ================= DELETE ================= */
elseif ($action === 'delete' && $method === 'POST') {

    $id = intval($_POST['id'] ?? 0);
    if ($id <= 0) sendResponse('error', 'Invalid ID');

    // Get image before deleting
    $res = $conn->query("SELECT image FROM equipment WHERE id=$id");
    if ($res->num_rows === 0) sendResponse('error', 'Not found');

    $row = $res->fetch_assoc();

    if (!empty($row['image']) && file_exists($row['image'])) {
        unlink($row['image']);
    }

    $stmt = $conn->prepare("DELETE FROM equipment WHERE id=?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();

    sendResponse('success', 'Deleted successfully');
}

else {
    sendResponse('error', 'Invalid action');
}

$conn->close();
?>
