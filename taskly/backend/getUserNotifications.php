<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$user_id = $_GET['user_id'] ?? 0;

if (!$user_id) {
    echo json_encode([]);
    exit;
}

$file = "notifications_user_{$user_id}.json";
if (file_exists($file)) {
    $data = json_decode(file_get_contents($file), true);
    echo json_encode($data);
    unlink($file); // Delete after reading
} else {
    echo json_encode([]);
}
?>