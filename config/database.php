<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'bantay_malagutay';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die('Database connection failed: ' . $conn->connect_error);
}

// Set charset to UTF-8
$conn->set_charset("utf8");
?>
