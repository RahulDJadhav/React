<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data['id']) ? intval($data['id']) : 0;
$user_id = isset($data['user_id']) ? intval($data['user_id']) : 0; // Expect user_id from frontend

if ($id === 0 || $user_id === 0) {
    echo json_encode(["message" => "Missing id or user_id"]);
    exit;
}

$sql = "DELETE FROM todotasks WHERE id = $id AND user_id = $user_id";

if ($conn->query($sql)) {
    if ($conn->affected_rows > 0) {
        echo json_encode(["message" => "Task deleted successfully!"]);
    } else {
        echo json_encode(["message" => "Task not found or does not belong to user."]);
    }
} else {
    echo json_encode(["message" => "Error deleting task: " . $conn->error]);
}

$conn->close();
?>