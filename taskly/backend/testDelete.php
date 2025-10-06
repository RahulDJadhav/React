<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

echo json_encode(['status' => 'working', 'message' => 'Delete endpoint is accessible']);
?>