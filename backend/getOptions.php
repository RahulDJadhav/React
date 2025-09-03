<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'db.php';

$options = [
    "priorities" => [
        ["name" => "Low", "value" => "Low"],
        ["name" => "Medium", "value" => "Medium"],
        ["name" => "High", "value" => "High"],
        ["name" => "Urgent", "value" => "Urgent"]
    ],
    "statuses" => [
        ["name" => "Open", "value" => "Open"],
        ["name" => "In Progress", "value" => "In Progress"],
        ["name" => "On Hold", "value" => "On Hold"],
        ["name" => "Cancelled", "value" => "Cancelled"],
        ["name" => "Completed", "value" => "Completed"]
    ],
    "assignees" => [
        ["id" => 1, "name" => "Admin"], // Example, fetch from users table if real
        ["id" => 2, "name" => "User1"]
    ]
];

echo json_encode($options);

$conn->close();
?>