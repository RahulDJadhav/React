<?php
// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    exit(0);
}

// Allow CORS for actual request
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// DB Connection
include 'db.php';

// Get user_id from query string
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id === 0) {
    echo json_encode(["error" => "Missing or invalid user_id"]);
    exit;
}

// Fetch tasks only for this user
$stmt = $conn->prepare("SELECT * FROM todotasks WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$tasks = [];

while ($row = $result->fetch_assoc()) {
    $row['is_done'] = (int)$row['is_done'];
    $row['is_important'] = (int)$row['is_important'];
    $row['is_favorite'] = (int)$row['is_favorite'];
    $tasks[] = $row;
}

echo json_encode($tasks);

$conn->close();
?>
