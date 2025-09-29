<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include 'db.php';

// Check table structure
$result = $conn->query("DESCRIBE users");
$columns = [];
while ($row = $result->fetch_assoc()) {
    $columns[] = $row;
}

// Check sample user data
$result2 = $conn->query("SELECT id, name, email, profile_pic FROM users LIMIT 3");
$users = [];
while ($row = $result2->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode([
    "table_structure" => $columns,
    "sample_users" => $users
]);

$conn->close();
?>