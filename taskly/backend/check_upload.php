<?php
echo "<h3>PHP Upload Configuration</h3>";
echo "file_uploads: " . (ini_get('file_uploads') ? 'Enabled' : 'Disabled') . "<br>";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "<br>";
echo "post_max_size: " . ini_get('post_max_size') . "<br>";
echo "max_file_uploads: " . ini_get('max_file_uploads') . "<br>";
echo "max_execution_time: " . ini_get('max_execution_time') . "<br>";
echo "memory_limit: " . ini_get('memory_limit') . "<br>";

echo "<h3>Directory Permissions</h3>";
$uploadDir = "uploads/";
echo "Upload directory exists: " . (is_dir($uploadDir) ? 'Yes' : 'No') . "<br>";
echo "Upload directory writable: " . (is_writable($uploadDir) ? 'Yes' : 'No') . "<br>";
echo "Upload directory path: " . realpath($uploadDir) . "<br>";

if (isset($_POST['test'])) {
    echo "<h3>Test Upload</h3>";
    if (isset($_FILES['testFile'])) {
        echo "File received: " . $_FILES['testFile']['name'] . "<br>";
        echo "File size: " . $_FILES['testFile']['size'] . "<br>";
        echo "File error: " . $_FILES['testFile']['error'] . "<br>";
    }
}
?>

<form method="post" enctype="multipart/form-data">
    <h3>Test File Upload</h3>
    <input type="file" name="testFile" accept="image/*">
    <button type="submit" name="test">Test Upload</button>
</form>