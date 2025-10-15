<?php
// CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    exit;
}
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);

$task_id = $input['task_id'] ?? 0;
$priority = $input['priority'] ?? '';
$due_date = $input['due_date'] ?? '';
$user_id = $input['user_id'] ?? 0;
$old_priority = $input['old_priority'] ?? '';
$old_due_date = $input['old_due_date'] ?? '';

if (!$task_id || !$user_id) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Update task
$stmt = $conn->prepare("UPDATE todotasks SET priority = ?, due_date = ? WHERE id = ?");
$stmt->bind_param("ssi", $priority, $due_date, $task_id);

if ($stmt->execute()) {
    // Create notification message
    $changes = [];
    if ($old_priority !== $priority) {
        $changes[] = "priority from '$old_priority' to '$priority'";
    }
    if ($old_due_date !== $due_date) {
        $changes[] = "due date from '$old_due_date' to '$due_date'";
    }
    
    if (!empty($changes)) {
        $notification = "Admin updated your task: " . implode(' and ', $changes) . ". Please focus on this task first.";
        
        // Store notification for user
        $notif_data = json_encode([
            'message' => $notification,
            'timestamp' => time(),
            'user_id' => $user_id
        ]);
        file_put_contents("notifications_user_{$user_id}.json", $notif_data);
    }
    
    echo json_encode(['success' => true, 'message' => 'Task updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update task']);
}

$conn->close();
?>