<?php
include "config.php";

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

/* ================= CREATE CATEGORY ================= */
if ($action === 'create' && $method === 'POST') {
    $data = getJsonBody();
    
    $name = $data['name'] ?? null;
    $description = $data['description'] ?? null;
    
    if (!$name) {
        sendResponse('error', 'Category name is required');
    }
    
    $stmt = $conn->prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
    $stmt->bind_param("ss", $name, $description);
    
    if ($stmt->execute()) {
        sendResponse('success', 'Category created successfully', [
            'id' => $stmt->insert_id,
            'name' => $name,
            'description' => $description
        ]);
    } else {
        sendResponse('error', 'Failed to create category: ' . $stmt->error);
    }
    $stmt->close()
}

/* ================= READ ALL CATEGORIES ================= */
elseif ($action === 'read' && $method === 'GET') {
    $stmt = $conn->prepare(
        "SELECT id, name, description, 
         (SELECT COUNT(*) FROM equipment WHERE categoryId = categories.id) as equipmentCount,
         createdAt FROM categories ORDER BY name ASC"
    );
    $stmt->execute();
    $result = $stmt->get_result();
    $categories = [];
    
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }
    
    sendResponse('success', '', $categories);
    $stmt->close();
}

/* ================= READ SINGLE CATEGORY ================= */
elseif ($action === 'read_one' && $method === 'GET') {
    $id = intval($_GET['id'] ?? 0);
    
    if ($id <= 0) {
        sendResponse('error', 'Invalid category ID');
    }
    
    $stmt = $conn->prepare(
        "SELECT id, name, description, 
         (SELECT COUNT(*) FROM equipment WHERE categoryId = categories.id) as equipmentCount,
         createdAt FROM categories WHERE id = ?"
    );
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        sendResponse('success', '', $result->fetch_assoc());
    } else {
        sendResponse('error', 'Category not found');
    }
    $stmt->close();
}

/* ================= UPDATE CATEGORY ================= */
elseif ($action === 'update' && $method === 'POST') {
    $data = getJsonBody();
    
    $id = intval($data['id'] ?? 0);
    if ($id <= 0) {
        sendResponse('error', 'Invalid category ID');
    }
    
    $name = $data['name'] ?? null;
    $description = $data['description'] ?? null;
    
    if (!$name) {
        sendResponse('error', 'Category name is required');
    }
    
    $stmt = $conn->prepare("UPDATE categories SET name = ?, description = ? WHERE id = ?");
    $stmt->bind_param("ssi", $name, $description, $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            sendResponse('success', 'Category updated successfully');
        } else {
            sendResponse('error', 'Category not found');
        }
    } else {
        sendResponse('error', 'Failed to update category: ' . $stmt->error);
    }
    $stmt->close();
}

/* ================= DELETE CATEGORY ================= */
elseif ($action === 'delete' && $method === 'POST') {
    $data = getJsonBody();
    $id = intval($data['id'] ?? 0);
    
    if ($id <= 0) {
        sendResponse('error', 'Invalid category ID');
    }
    
    // Check if category has equipment
    $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM equipment WHERE categoryId = ?");
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    $checkResult = $result->fetch_assoc();
    
    if ($checkResult['count'] > 0) {
        sendResponse('error', 'Cannot delete category with associated equipment');
    }
    
    $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            sendResponse('success', 'Category deleted successfully');
        } else {
            sendResponse('error', 'Category not found');
        }
    } else {
        sendResponse('error', 'Failed to delete category');
    }
    $stmt->close();
    $checkStmt->close();
}

else {
    sendResponse('error', 'Invalid action or method');
}

$conn->close();
?>
