<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? intval($data['id']) : 0;
$is_important = isset($data['is_important']) ? intval($data['is_important']) : null;
$user_id = isset($data['user_id']) ? intval($data['user_id']) : 0; // Expect user_id from frontend

if ($id === 0 || $is_important === null || $user_id === 0) {
    echo json_encode(["message" => "Missing required parameters (id, is_important, or user_id)."]);
    exit;
}

$sql = "UPDATE todotasks SET is_important = $is_important WHERE id = $id AND user_id = $user_id";

if ($conn->query($sql)) {
    if ($conn->affected_rows > 0) {
        echo json_encode(["message" => "Important status updated"]);
    } else {
        echo json_encode(["message" => "Task not found or does not belong to user."]);
    }
} else {
    echo json_encode(["message" => "Error updating important status: " . $conn->error]);
}

$conn->close();
?>