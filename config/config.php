<?php
// Application Configuration
define('APP_NAME', 'BantayBarangay Malagutay');
define('APP_VERSION', '1.0.0');
define('BASE_URL', 'http://localhost/bantay-barangay/');

// Emergency Contact Numbers
define('EMERGENCY_HOTLINE', '117');
define('BARANGAY_HOTLINE', '09123456789');

// SMS API Configuration (Semaphore)
define('SMS_API_KEY', 'your_semaphore_api_key_here');
define('SMS_SENDER_NAME', 'BANTAY_MALAGUTAY');

// Email Configuration
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your_email@gmail.com');
define('SMTP_PASSWORD', 'your_app_password');
define('SMTP_FROM_EMAIL', 'your_email@gmail.com');
define('SMTP_FROM_NAME', 'BantayBarangay Malagutay');

// File Upload Settings
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif']);

// Session Configuration
ini_set('session.gc_maxlifetime', 3600); // 1 hour
session_set_cookie_params(3600);

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
?>
