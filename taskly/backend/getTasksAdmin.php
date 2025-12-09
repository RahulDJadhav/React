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

// Optional filters: ?status=Open|In%20Progress|On%20Hold|Cancelled|Completed&user_id=123&q=search&priority=High
$status   = isset($_GET['status'])   ? trim($_GET['status']) : '';
$user_id  = isset($_GET['user_id'])  ? intval($_GET['user_id']) : 0;
$q        = isset($_GET['q'])        ? trim($_GET['q']) : '';
$priority = isset($_GET['priority']) ? trim($_GET['priority']) : '';

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
  // Handle special search queries
  if (strpos($q, 'due_date:') === 0) {
    // Today filter: due_date:2024-01-15
    $date = substr($q, 9);
    $clauses[] = "t.due_date = ?";
    $params[] = $date;
    $types .= 's';
  } elseif (strpos($q, 'week:') === 0) {
    // Week filter: week:2024-01-14-2024-01-20
    $dateRange = substr($q, 5);
    $dates = explode('-', $dateRange);
    if (count($dates) >= 6) { // YYYY-MM-DD-YYYY-MM-DD format
      $startDate = $dates[0] . '-' . $dates[1] . '-' . $dates[2];
      $endDate = $dates[3] . '-' . $dates[4] . '-' . $dates[5];
      $clauses[] = "t.due_date BETWEEN ? AND ?";
      $params[] = $startDate;
      $params[] = $endDate;
      $types .= 'ss';
    }
  } elseif (strpos($q, 'overdue:') === 0) {
    // Overdue filter: overdue:2024-01-15
    $today = substr($q, 8);
    $clauses[] = "t.due_date < ? AND t.status != 'Completed'";
    $params[] = $today;
    $types .= 's';
  } else {
    // Regular text search
    $clauses[] = "(t.title LIKE ? OR t.description LIKE ?)";
    $like = "%{$q}%";
    $params[] = $like; $params[] = $like;
    $types .= 'ss';
  }
}
if ($priority !== '' && $priority !== 'All') {
  $clauses[] = "t.priority = ?";
  $params[]  = $priority;
  $types    .= 's';
}

$where = $clauses ? implode(' AND ', $clauses) : '';

$sql = "
  SELECT
    t.id, t.title, t.description, t.start_date, t.due_date, t.priority, t.status,
    t.is_favorite, t.is_important, t.is_done, t.user_id,
    u.name AS user_name, u.email AS user_email
  FROM todotasks t
  LEFT JOIN users u ON u.id = t.user_id
  WHERE u.role != 'hr' " . ($where ? "AND " . str_replace('WHERE ', '', $where) : '') . "
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
