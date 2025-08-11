<?php
require_once 'config/config.php';
require_once 'config/database.php';

// Authentication functions
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function getCurrentUser() {
    if (!isLoggedIn()) return null;
    
    global $conn;
    $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}

function hasRole($role) {
    $user = getCurrentUser();
    return $user && $user['role'] === $role;
}

function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

function requireRole($role) {
    requireLogin();
    if (!hasRole($role)) {
        header('Location: dashboard.php');
        exit;
    }
}

// Utility functions
function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// SMS function
function sendSMS($phoneNumber, $message) {
    $apiKey = SMS_API_KEY;
    $senderName = SMS_SENDER_NAME;
    
    $data = [
        'apikey' => $apiKey,
        'number' => $phoneNumber,
        'message' => $message,
        'sendername' => $senderName
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://semaphore.co/api/v4/messages');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Email function
function sendEmail($to, $subject, $message) {
    $headers = "From: " . SMTP_FROM_NAME . " <" . SMTP_FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . SMTP_FROM_EMAIL . "\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    
    return mail($to, $subject, $message, $headers);
}

// File upload function
function uploadFile($file, $uploadDir) {
    if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
        return false;
    }
    
    $allowedTypes = ALLOWED_IMAGE_TYPES;
    $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($fileExt, $allowedTypes)) {
        return false;
    }
    
    if ($file['size'] > MAX_FILE_SIZE) {
        return false;
    }
    
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $fileName = uniqid() . '.' . $fileExt;
    $filePath = $uploadDir . $fileName;
    
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        return $fileName;
    }
    
    return false;
}

// Get alert severity color
function getAlertSeverityColor($severity) {
    switch ($severity) {
        case 'watch': return 'warning';
        case 'warning': return 'danger';
        case 'critical': return 'dark';
        default: return 'info';
    }
}

// Format date for display
function formatDate($date) {
    return date('M j, Y g:i A', strtotime($date));
}
?>
