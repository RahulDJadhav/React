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
if (isset($_FILES['profilePic']) && $_FILES['profilePic']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = "uploads/";
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $ext = pathinfo($_FILES['profilePic']['name'], PATHINFO_EXTENSION);
    $fileName = "profile_" . uniqid() . "." . $ext;
    $filePath = $uploadDir . $fileName;

    if (move_uploaded_file($_FILES['profilePic']['tmp_name'], $filePath)) {
        // Return full URL
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'];
        $base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\') . "/";
        $profilePicUrl = $protocol . $host . $base . $filePath;
    }
}

// Update DB
if ($profilePicUrl) {
    $sql = "UPDATE users SET name = ?, profile_pic = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssi", $name, $profilePicUrl, $id);
} else {
    $sql = "UPDATE users SET name = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $name, $id);
}

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Profile updated.",
        "profilePicUrl" => $profilePicUrl
    ]);
} else {
    echo json_encode(["success" => false, "message" => "DB error: " . $conn->error]);
}
$stmt->close();
$conn->close();
