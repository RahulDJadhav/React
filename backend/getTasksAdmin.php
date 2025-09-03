<?php
// CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header("Access-Control-Allow-Origin: *");
  header("Access-Control-Allow-Methods: GET, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type");
  exit;
}
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require 'db.php';

// Optional filters: ?status=Open|In%20Progress|On%20Hold|Cancelled|Completed&user_id=123&q=search
$status  = isset($_GET['status'])  ? trim($_GET['status']) : '';
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
$q       = isset($_GET['q'])       ? trim($_GET['q']) : '';

$clauses = [];
$params  = [];
$types   = '';

if ($status !== '') {
  $clauses[] = "t.status = ?";
  $params[]  = $status;
  $types    .= 's';
}
if ($user_id > 0) {
  $clauses[] = "t.user_id = ?";
  $params[]  = $user_id;
  $types    .= 'i';
}
if ($q !== '') {
  $clauses[] = "(t.title LIKE ? OR t.description LIKE ?)";
  $like = "%{$q}%";
  $params[] = $like; $params[] = $like;
  $types .= 'ss';
}

$where = $clauses ? ('WHERE ' . implode(' AND ', $clauses)) : '';

$sql = "
  SELECT
    t.id, t.title, t.description, t.start_date, t.due_date, t.priority, t.status,
    t.is_favorite, t.is_important, t.is_done, t.user_id,
    u.name AS user_name, u.email AS user_email
  FROM todotasks t
  LEFT JOIN users u ON u.id = t.user_id
  $where
  ORDER BY u.name ASC, t.due_date ASC, t.id DESC
";

$stmt = $conn->prepare($sql);
if ($types !== '') {
  $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$res = $stmt->get_result();

$tasks = [];
while ($row = $res->fetch_assoc()) {
  $row['is_done'] = (int)$row['is_done'];
  $row['is_important'] = (int)$row['is_important'];
  $row['is_favorite'] = (int)$row['is_favorite'];
  $tasks[] = $row;
}

echo json_encode($tasks);
