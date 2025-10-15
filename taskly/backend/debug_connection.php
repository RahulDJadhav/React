<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include 'db.php';

echo json_encode([
    'database_host' => $host,
    'database_name' => $db,
    'database_user' => $user,
    'connection_status' => $conn->connect_error ? 'failed' : 'success',
    'server_info' => $_SERVER['SERVER_NAME'] ?? 'unknown'
]);
?>