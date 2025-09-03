<?php

// Headers for allowing cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

// Database connection
$conn = new mysqli("localhost", "root", "", "taskly");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get data from POST request
$data = json_decode(file_get_contents("php://input"));

// Extract data
$name = $conn->real_escape_string($data->name ?? '');
$email = $conn->real_escape_string($data->email ?? '');
$password = password_hash($conn->real_escape_string($data->password ?? ''), PASSWORD_DEFAULT);

// Check if email already exists
$checkEmail = "SELECT id FROM users WHERE email = '$email'";
$result = $conn->query($checkEmail);

if ($result && $result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already exists."]);
} else {
    // Insert new user
    $sql = "INSERT INTO users (name, email, password, role) VALUES ('$name', '$email', '$password', 'user')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "User registered successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $sql . "<br>" . $conn->error]);
    }
}

$conn->close();
?>
