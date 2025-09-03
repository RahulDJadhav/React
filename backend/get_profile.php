<?php

// header("Access-Control-Allow-Origin: *");
// header("Access-Control-Allow-Headers: Content-Type");
// header("Access-Control-Allow-Methods: GET");
// header("Content-Type: application/json");

// include 'db.php';

// $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null; // Get user_id if needed

// // Assuming a generic profile fetch or based on a default user/first user
// $stmt = $conn->prepare("SELECT id, name, email, role FROM users LIMIT 1"); // Fetch first user as example
// $stmt->execute();
// $result = $stmt->get_result();

// $profile = null;
// if ($row = $result->fetch_assoc()) {
//     $profile = $row;
// }

// echo json_encode($profile);

// $conn->close();
?>
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");

include 'db.php';

$userId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($userId > 0) {
    $sql = "SELECT id, name, email, profile_pic FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            "success" => true,
            "data" => $row
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "User not found"
        ]);
    }

    $stmt->close();
} else {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user ID"
    ]);
}

$conn->close();
?>
