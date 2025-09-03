
<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Handle preflight CORS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    exit(0);
}

// Allow actual request
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Connect DB
$conn = new mysqli("localhost", "root", "", "taskly");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Connection failed: " . $conn->connect_error]);
    exit;
}

$rawData = file_get_contents("php://input");
$data = json_decode($rawData);

// Validate required fields, including user_id
if (
    isset($data->title) && isset($data->dueDate) &&
    isset($data->priority) && isset($data->status) &&
    isset($data->user_id) // Expect user_id from frontend
) {
    // Extract and sanitize fields
    $user_id = intval($data->user_id); // Get user_id from request body
    $title = $conn->real_escape_string($data->title);
    $description = $conn->real_escape_string($data->description ?? '');
    $startDate = $conn->real_escape_string($data->startDate ?? '');
    $dueDate = $conn->real_escape_string($data->dueDate);
    $priority = $conn->real_escape_string($data->priority);
    $status = $conn->real_escape_string($data->status);
    $is_favorite = isset($data->is_favorite) ? intval($data->is_favorite) : 0;
    $is_important = isset($data->is_important) ? intval($data->is_important) : 0;
    $is_done = isset($data->is_done) ? intval($data->is_done) : 0;

    $sql = "INSERT INTO todotasks 
    (user_id, title, description, start_date, due_date, priority, status, is_favorite, is_important, is_done)
    VALUES 
    ($user_id, '$title', '$description', '$startDate', '$dueDate', '$priority', '$status', $is_favorite, $is_important, $is_done)";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["message" => "Task added successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $conn->error, "query" => $sql]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields or invalid input."]);
}

$conn->close();
?>