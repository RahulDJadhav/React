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
$token = $conn->real_escape_string($data->token ?? '');
$newPassword = $data->password ?? '';

if (empty($token) || empty($newPassword)) {
    echo json_encode(["success" => false, "message" => "Token and password are required."]);
    exit;
}

// Validate token
$query = "SELECT pr.user_id, u.email FROM password_resets pr 
          JOIN users u ON pr.user_id = u.id 
          WHERE pr.token = '$token' AND pr.expires_at > NOW()";
$result = $conn->query($query);

if ($result && $result->num_rows === 1) {
    $resetData = $result->fetch_assoc();
    $userId = $resetData['user_id'];
    
    // Hash new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update user password
    $updateQuery = "UPDATE users SET password = '$hashedPassword' WHERE id = $userId";
    
    if ($conn->query($updateQuery)) {
        // Delete used token
        $deleteToken = "DELETE FROM password_resets WHERE token = '$token'";
        $conn->query($deleteToken);
        
        echo json_encode(["success" => true, "message" => "Password reset successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update password."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid or expired reset token."]);
}

$conn->close();
?>