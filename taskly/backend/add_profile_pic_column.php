<?php
include 'db.php';

// Check if profile_pic column exists, if not add it
$result = $conn->query("SHOW COLUMNS FROM users LIKE 'profile_pic'");

if ($result->num_rows == 0) {
    // Column doesn't exist, add it
    $sql = "ALTER TABLE users ADD COLUMN profile_pic VARCHAR(255) NULL";
    if ($conn->query($sql) === TRUE) {
        echo "profile_pic column added successfully";
    } else {
        echo "Error adding column: " . $conn->error;
    }
} else {
    echo "profile_pic column already exists";
}

$conn->close();
?>