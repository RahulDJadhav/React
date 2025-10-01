<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "db.php";

$id   = isset($_POST['id']) ? (int) $_POST['id'] : 0;
$name = isset($_POST['name']) ? trim($_POST['name']) : "";

if ($id <= 0 || empty($name)) {
    echo json_encode(["success" => false, "message" => "Invalid input data."]);
    exit;
}

// Handle profile picture upload
$profilePicUrl = null;
if (isset($_FILES['profilePic'])) {
    $file = $_FILES['profilePic'];
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'File too large (server limit)',
            UPLOAD_ERR_FORM_SIZE => 'File too large (form limit)',
            UPLOAD_ERR_PARTIAL => 'File partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'No temp directory',
            UPLOAD_ERR_CANT_WRITE => 'Cannot write to disk',
            UPLOAD_ERR_EXTENSION => 'Upload blocked by extension'
        ];
        echo json_encode(["success" => false, "message" => $errors[$file['error']] ?? 'Upload error']);
        exit;
    }
    
    $uploadDir = "uploads/";
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            echo json_encode(["success" => false, "message" => "Cannot create upload directory"]);
            exit;
        }
        chmod($uploadDir, 0777); // Ensure writable
    }
    
    // Try to make writable if it exists but not writable
    if (!is_writable($uploadDir)) {
        chmod($uploadDir, 0777);
    }
    
    if (!is_writable($uploadDir)) {
        echo json_encode(["success" => false, "message" => "Upload directory not writable"]);
        exit;
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowedExts = ['jpg', 'jpeg', 'png', 'gif'];
    
    if (!in_array($ext, $allowedExts)) {
        echo json_encode(["success" => false, "message" => "Invalid file type. Use JPG, PNG, or GIF"]);
        exit;
    }
    
    $fileName = "profile_" . uniqid() . "." . $ext;
    $filePath = $uploadDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        // Return relative URL for database storage
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'];
        $base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\') . "/";
        $profilePicUrl = $protocol . $host . $base . $filePath;
    } else {
        echo json_encode(["success" => false, "message" => "Failed to move uploaded file"]);
        exit;
    }
}

// Update DB
if ($profilePicUrl) {
    $sql = "UPDATE users SET name = ?, profile_pic = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->error]);
        exit;
    }
    $stmt->bind_param("ssi", $name, $profilePicUrl, $id);
} else {
    $sql = "UPDATE users SET name = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->error]);
        exit;
    }
    $stmt->bind_param("si", $name, $id);
}

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Profile updated successfully",
        "profilePicUrl" => $profilePicUrl
    ]);
} else {
    echo json_encode(["success" => false, "message" => "DB error: " . $stmt->error]);
}
$stmt->close();
$conn->close();
?>
