<?php
$host = "192.168.1.187";
$user = "usrtask";
$pass = 'XtsTsk&$envtask';
$db = "taskly";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
?>