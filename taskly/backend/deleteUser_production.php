<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['user_id'] ?? '';
    
    if (empty($userId)) {
        echo json_encode(['success' => false, 'message' => 'User ID required']);
        exit;
    }
    
    include 'db.php';
    
    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit;
    }
    
    // Delete user's tasks first (if tasks table exists)
    $stmt1 = $conn->prepare("DELETE FROM todotasks WHERE user_id = ?");
    if ($stmt1) {
        $stmt1->bind_param("i", $userId);
        $stmt1->execute();
        $stmt1->close();
    }
    
    // Delete user
    $stmt2 = $conn->prepare("DELETE FROM users WHERE id = ?");
    if ($stmt2) {
        $stmt2->bind_param("i", $userId);
        $stmt2->execute();
        
        if ($stmt2->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'User deleted']);
        } else {
            echo json_encode(['success' => false, 'message' => 'User not found']);
        }
        
        $stmt2->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error']);
    }
    
    $conn->close();
}
?>