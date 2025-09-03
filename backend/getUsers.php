<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header("Access-Control-Allow-Origin: *");
  header("Access-Control-Allow-Methods: GET, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type");
  exit;
}
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require 'db.php';

$sql = "SELECT id, name, email FROM users ORDER BY name ASC";
$res = $conn->query($sql);

$users = [];
while ($row = $res->fetch_assoc()) {
  $users[] = $row;
}
echo json_encode($users);
