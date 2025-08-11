<?php
require_once '../includes/functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

// Check if user is authorized to create alerts
if (!isLoggedIn() || (!hasRole('admin') && !hasRole('official'))) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$title = sanitizeInput($_POST['title'] ?? '');
$message = sanitizeInput($_POST['message'] ?? '');
$alert_type = sanitizeInput($_POST['alert_type'] ?? '');
$severity = sanitizeInput($_POST['severity'] ?? '');
$created_by = $_SESSION['user_id'];

// Validation
if (empty($title) || empty($message) || empty($alert_type) || empty($severity)) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$valid_types = ['flood', 'landslide', 'storm', 'general'];
$valid_severities = ['watch', 'warning', 'critical'];

if (!in_array($alert_type, $valid_types) || !in_array($severity, $valid_severities)) {
    echo json_encode(['success' => false, 'error' => 'Invalid alert type or severity']);
    exit;
}

try {
    $stmt = $conn->prepare("
        INSERT INTO alerts (title, message, alert_type, severity, created_by) 
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("ssssi", $title, $message, $alert_type, $severity, $created_by);
    
    if ($stmt->execute()) {
        $alert_id = $conn->insert_id;
        
        // Send SMS notifications to all active users
        $user_stmt = $conn->prepare("SELECT contact_number FROM users WHERE active = 1 AND contact_number IS NOT NULL");
        $user_stmt->execute();
        $users = $user_stmt->get_result();
        
        $sms_message = "ALERT: $title - $message. Stay safe!";
        
        while ($user = $users->fetch_assoc()) {
            if (!empty($user['contact_number'])) {
                sendSMS($user['contact_number'], $sms_message);
            }
        }
        
        echo json_encode([
            'success' => true,
            'alert_id' => $alert_id,
            'message' => 'Alert created and notifications sent'
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to create alert']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error']);
}
?>
