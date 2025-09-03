<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? intval($data['id']) : 0;
$is_done = isset($data['is_done']) ? intval($data['is_done']) : null;
$status = isset($data['status']) ? $conn->real_escape_string($data['status']) : '';
$user_id = isset($data['user_id']) ? intval($data['user_id']) : 0; // Expect user_id from frontend

if ($id === 0 || $is_done === null || $status === '' || $user_id === 0) {
    echo json_encode(["message" => "Missing required parameters (id, is_done, status, or user_id)."]);
    exit;
}

$sql = "UPDATE todotasks SET is_done = $is_done, status = '$status' WHERE id = $id AND user_id = $user_id";

if ($conn->query($sql)) {
    if ($conn->affected_rows > 0) {
        echo json_encode(["message" => "Done status and/or status updated"]);
    } else {
        echo json_encode(["message" => "Task not found or does not belong to user."]);
    }
} else {
    echo json_encode(["message" => "Error updating status: " . $conn->error]);
}

$conn->close();
?>
