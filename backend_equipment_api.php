<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$host = 'localhost';
$dbname = 'agribook_hub'; // Replace with your database name
$username = 'root'; // Replace with your DB username
$password = ''; // Replace with your DB password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

$action = $_GET['action'] ?? '';

switch($action) {
    case 'create':
        createEquipment($pdo);
        break;
    case 'read':
        readEquipment($pdo);
        break;
    case 'read_one':
        readOneEquipment($pdo);
        break;
    case 'update':
        updateEquipment($pdo);
        break;
    case 'delete':
        deleteEquipment($pdo);
        break;
    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
}

function createEquipment($pdo) {
    try {
        // Handle field name variations (frontend uses camelCase, database uses snake_case)
        // Map frontend field names to database field names
        $fieldMap = [
            'name' => $_POST['name'] ?? null,
            'modelNumber' => $_POST['modelNumber'] ?? null,
            'categoryId' => $_POST['categoryId'] ?? null,
            'hourly_rate' => $_POST['hourly_rate'] ?? null,
            'pricePerDay' => $_POST['pricePerDay'] ?? null,
            'description' => $_POST['description'] ?? null,
            'status' => $_POST['status'] ?? null
        ];

        // Check if required fields are present
        $required_fields = ['name', 'modelNumber', 'categoryId', 'hourly_rate', 'pricePerDay', 'description', 'status'];
        foreach ($required_fields as $field) {
            if (empty($fieldMap[$field])) {
                echo json_encode(['status' => 'error', 'message' => "Missing required field: $field. Received value: " . ($fieldMap[$field] ?? 'NULL')]);
                return;
            }
        }

        // Handle file upload - this is now mandatory
        $imagePath = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/';
            
            // Create uploads directory if it doesn't exist
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
            $targetPath = $uploadDir . $fileName;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                $imagePath = $targetPath;
            } else {
                throw new Exception('Failed to upload image');
            }
        } else {
            // If no file was uploaded, return an error
            echo json_encode(['status' => 'error', 'message' => 'Image file is required']);
            return;
        }

        $stmt = $pdo->prepare("INSERT INTO equipment (name, model_number, category_id, hourly_rate, price_per_day, description, image, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        
        $result = $stmt->execute([
            $fieldMap['name'],
            $fieldMap['modelNumber'],
            $fieldMap['categoryId'],
            floatval($fieldMap['hourly_rate']),
            floatval($fieldMap['pricePerDay']),
            $fieldMap['description'],
            $imagePath,
            $fieldMap['status']
        ]);

        if ($result) {
            echo json_encode(['status' => 'success', 'message' => 'Equipment created successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to create equipment']);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function readEquipment($pdo) {
    try {
        $sql = "SELECT e.*, c.name as category_name FROM equipment e LEFT JOIN categories c ON e.category_id = c.id";
        
        // Add filters if provided
        $params = [];
        if (isset($_GET['categoryId'])) {
            $sql .= " WHERE e.category_id = ?";
            $params[] = $_GET['categoryId'];
        }
        
        if (isset($_GET['status'])) {
            $sql .= isset($_GET['categoryId']) ? " AND e.status = ?" : " WHERE e.status = ?";
            $params[] = $_GET['status'];
        }
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the results to match frontend expectations
        $formattedResults = array_map(function($item) {
            return [
                'id' => $item['id'],
                'name' => $item['name'],
                'modelNumber' => $item['model_number'],
                'categoryId' => $item['category_id'],
                'categoryName' => $item['category_name'],
                'hourlyRate' => floatval($item['hourly_rate']),
                'pricePerDay' => floatval($item['price_per_day']),
                'description' => $item['description'],
                'image' => $item['image'], // This could be a local path or URL
                'status' => $item['status'],
                'createdAt' => $item['created_at']
            ];
        }, $results);
        
        echo json_encode(['status' => 'success', 'data' => $formattedResults]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function readOneEquipment($pdo) {
    try {
        $id = $_GET['id'] ?? 0;
        
        $stmt = $pdo->prepare("SELECT e.*, c.name as category_name FROM equipment e LEFT JOIN categories c ON e.category_id = c.id WHERE e.id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $formattedResult = [
                'id' => $result['id'],
                'name' => $result['name'],
                'modelNumber' => $result['model_number'],
                'categoryId' => $result['category_id'],
                'categoryName' => $result['category_name'],
                'hourlyRate' => floatval($result['hourly_rate']),
                'pricePerDay' => floatval($result['price_per_day']),
                'description' => $result['description'],
                'image' => $result['image'],
                'status' => $result['status'],
                'createdAt' => $result['created_at']
            ];
            
            echo json_encode(['status' => 'success', 'data' => $formattedResult]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Equipment not found']);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function updateEquipment($pdo) {
    try {
        $id = $_POST['id'] ?? 0;
        
        if (!$id) {
            echo json_encode(['status' => 'error', 'message' => 'Equipment ID is required']);
            return;
        }
        
        // Handle field name variations (frontend uses camelCase, database uses snake_case)
        // Map frontend field names to database field names
        $fieldMap = [
            'name' => $_POST['name'] ?? null,
            'modelNumber' => $_POST['modelNumber'] ?? null,
            'category_id' => $_POST['category_id'] ?? $_POST['categoryId'] ?? null, // Support both naming conventions
            'hourly_rate' => $_POST['hourly_rate'] ?? null,
            'price_per_day' => $_POST['price_per_day'] ?? $_POST['pricePerDay'] ?? null, // Support both naming conventions
            'description' => $_POST['description'] ?? null,
            'status' => $_POST['status'] ?? null
        ];

        // Check if required fields are present
        $required_fields = ['name', 'category_id', 'hourly_rate', 'price_per_day', 'description', 'status'];
        foreach ($required_fields as $field) {
            if (empty($fieldMap[$field])) {
                echo json_encode(['status' => 'error', 'message' => "Missing required field: $field"]);
                return;
            }
        }
        
        // Handle file upload if present
        $imagePath = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/';
            
            // Create uploads directory if it doesn't exist
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
            $targetPath = $uploadDir . $fileName;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                $imagePath = $targetPath;
            } else {
                throw new Exception('Failed to upload image');
            }
        }
        // Note: We're not supporting URL updates anymore, only file uploads
        
        // Prepare the update query based on whether image is being updated
        if ($imagePath) {
            $stmt = $pdo->prepare("UPDATE equipment SET name=?, model_number=?, category_id=?, hourly_rate=?, price_per_day=?, description=?, image=?, status=? WHERE id=?");
            $params = [
                $fieldMap['name'],
                $fieldMap['modelNumber'],
                $fieldMap['category_id'],
                floatval($fieldMap['hourly_rate']),
                floatval($fieldMap['price_per_day']),
                $fieldMap['description'],
                $imagePath,
                $fieldMap['status'],
                $id
            ];
        } else {
            $stmt = $pdo->prepare("UPDATE equipment SET name=?, model_number=?, category_id=?, hourly_rate=?, price_per_day=?, description=?, status=? WHERE id=?");
            $params = [
                $fieldMap['name'],
                $fieldMap['modelNumber'],
                $fieldMap['category_id'],
                floatval($fieldMap['hourly_rate']),
                floatval($fieldMap['price_per_day']),
                $fieldMap['description'],
                $fieldMap['status'],
                $id
            ];
        }
        
        $result = $stmt->execute($params);

        if ($result) {
            echo json_encode(['status' => 'success', 'message' => 'Equipment updated successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to update equipment']);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function deleteEquipment($pdo) {
    try {
        $id = $_POST['id'] ?? 0;
        
        // First, get the equipment record to check if it has an image file to delete
        $stmt = $pdo->prepare("SELECT image FROM equipment WHERE id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result && !empty($result['image']) && file_exists($result['image'])) {
            // Delete the associated image file
            unlink($result['image']);
        }
        
        $stmt = $pdo->prepare("DELETE FROM equipment WHERE id = ?");
        $result = $stmt->execute([$id]);

        if ($result) {
            echo json_encode(['status' => 'success', 'message' => 'Equipment deleted successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to delete equipment']);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
?>