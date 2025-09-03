<?php

// CORS headers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Type: application/json");
    exit(0);
}
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// DB connection
$conn = new mysqli("localhost", "root", "", "taskly");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit;
}

// Get raw POST data
$data = json_decode(file_get_contents("php://input"));

$email = $conn->real_escape_string($data->email ?? '');
$password = $data->password ?? '';

// Find user by email
$query = "SELECT * FROM users WHERE email = '$email'";
$result = $conn->query($query);

if ($result && $result->num_rows === 1) {
    $user = $result->fetch_assoc();
    // Verify password
    if (password_verify($password, $user['password'])) {
        // Frontend handles localStorage for user info
        echo json_encode([
            "success" => true,
            "message" => "Login successful.",
            "user" => [
                "id" => $user['id'],
                "email" => $user['email'],
                "name" => $user['name'],
                "role" => $user['role']
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Incorrect password."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "User not found."]);
}

$conn->close();
?>
