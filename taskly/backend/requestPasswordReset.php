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

include 'db.php';

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));
$email = $conn->real_escape_string($data->email ?? '');

if (empty($email)) {
    echo json_encode(["success" => false, "message" => "Email is required."]);
    exit;
}

// Check if user exists
$query = "SELECT id FROM users WHERE email = '$email'";
$result = $conn->query($query);

if ($result && $result->num_rows === 1) {
    $user = $result->fetch_assoc();
    $userId = $user['id'];
    
    // Generate reset token
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    // Create password_resets table if not exists
    $createTable = "CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(64) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $conn->query($createTable);
    
    // Delete existing tokens for this user
    $deleteOld = "DELETE FROM password_resets WHERE user_id = $userId";
    $conn->query($deleteOld);
    
    // Insert new token
    $insertToken = "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($userId, '$token', '$expires')";
    
    if ($conn->query($insertToken)) {
        // In a real application, you would send an email here
        // For demo purposes, we'll return the token (DON'T do this in production)
        echo json_encode([
            "success" => true, 
            "message" => "Password reset instructions sent to your email.",
            "token" => $token // Remove this in production
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to generate reset token."]);
    }
} else {
    // Return success even if user doesn't exist (security best practice)
    echo json_encode(["success" => true, "message" => "If an account with that email exists, password reset instructions have been sent."]);
}

$conn->close();
?>