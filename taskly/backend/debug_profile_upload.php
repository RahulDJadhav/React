<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Debug information
$debug = [
    'POST' => $_POST,
    'FILES' => $_FILES,
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'max_file_uploads' => ini_get('max_file_uploads'),
    'file_uploads' => ini_get('file_uploads') ? 'enabled' : 'disabled'
];

// Check if uploads directory exists and is writable
$uploadDir = "uploads/";
$debug['upload_dir_exists'] = is_dir($uploadDir);
$debug['upload_dir_writable'] = is_writable($uploadDir);

// Check file upload
if (isset($_FILES['profilePic'])) {
    $file = $_FILES['profilePic'];
    $debug['file_error'] = $file['error'];
    $debug['file_size'] = $file['size'];
    $debug['file_type'] = $file['type'];
    $debug['file_tmp_name'] = $file['tmp_name'];
    $debug['tmp_file_exists'] = file_exists($file['tmp_name']);
    
    // Error messages
    $uploadErrors = [
        UPLOAD_ERR_OK => 'No error',
        UPLOAD_ERR_INI_SIZE => 'File too large (php.ini)',
        UPLOAD_ERR_FORM_SIZE => 'File too large (form)',
        UPLOAD_ERR_PARTIAL => 'Partial upload',
        UPLOAD_ERR_NO_FILE => 'No file uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'No temp directory',
        UPLOAD_ERR_CANT_WRITE => 'Cannot write to disk',
        UPLOAD_ERR_EXTENSION => 'Extension stopped upload'
    ];
    
    $debug['error_message'] = $uploadErrors[$file['error']] ?? 'Unknown error';
}

echo json_encode($debug, JSON_PRETTY_PRINT);
?>