<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$host = "localhost";
$user = "root";
$pass = "";
$db = "taskly";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(['error' => 'Connection failed: ' . $conn->connect_error]);
    exit;
}

// First, let's see the table structure
$result = $conn->query("DESCRIBE users");
$columns = [];
while ($row = $result->fetch_assoc()) {
    $columns[] = $row;
}

// Then get the actual data
$sql = "SELECT * FROM users LIMIT 3";
$res = $conn->query($sql);
$users = [];
while ($row = $res->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode([
    'table_structure' => $columns,
    'sample_data' => $users
]);
?>