-- Database: bantay_malagutay
-- BantayBarangay Malagutay Database Schema
-- Created for XAMPP MySQL

CREATE DATABASE IF NOT EXISTS bantay_malagutay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bantay_malagutay;

-- Users table with role-based access
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'official', 'resident', 'responder') DEFAULT 'resident',
    contact_number VARCHAR(15),
    address TEXT,
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_active (active)
);

-- Rescue requests table
CREATE TABLE rescue_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(15) NOT NULL,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    address TEXT NOT NULL,
    emergency_type ENUM('trapped', 'medical', 'evacuation', 'missing', 'fire', 'other') NOT NULL,
    description TEXT,
    family_members INT DEFAULT 1,
    photo_path VARCHAR(255),
    status ENUM('pending', 'acknowledged', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    assigned_responder INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    INDEX idx_status (status),
    INDEX idx_emergency_type (emergency_type),
    INDEX idx_created_at (created_at),
    INDEX idx_location (location_lat, location_lng),
    FOREIGN KEY (assigned_responder) REFERENCES users(id) ON DELETE SET NULL
);

-- Emergency alerts table
CREATE TABLE alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    alert_type ENUM('flood', 'landslide', 'storm', 'fire', 'general') NOT NULL,
    severity ENUM('watch', 'warning', 'critical') NOT NULL,
    created_by INT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    
    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_active (active),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Aid distribution tracking table
CREATE TABLE aid_distributions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    household_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    contact_number VARCHAR(15),
    items_given TEXT NOT NULL,
    quantity INT NOT NULL,
    distributed_by INT NOT NULL,
    distribution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    INDEX idx_household_name (household_name),
    INDEX idx_distribution_date (distribution_date),
    FOREIGN KEY (distributed_by) REFERENCES users(id)
);

-- Evacuation centers table
CREATE TABLE evacuation_centers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    capacity INT NOT NULL,
    current_occupancy INT DEFAULT 0,
    contact_person VARCHAR(100),
    contact_number VARCHAR(15),
    facilities TEXT,
    status ENUM('active', 'full', 'closed') DEFAULT 'active',
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_location (location_lat, location_lng)
);

-- Emergency contacts table
CREATE TABLE emergency_contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    service_type ENUM('medical', 'fire', 'police', 'rescue', 'utilities', 'other') NOT NULL,
    available_24h BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_service_type (service_type),
    INDEX idx_active (active)
);

-- Activity logs table for tracking system usage
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- SMS notifications log
CREATE TABLE sms_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone_number VARCHAR(15) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    provider_response TEXT,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_phone_number (phone_number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Insert default admin user
INSERT INTO users (username, password, role, contact_number, address, active) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '09123456789', 'Barangay Malagutay Hall', TRUE);
-- Default password is 'password' (change this in production!)

-- Insert sample evacuation centers for Barangay Malagutay
INSERT INTO evacuation_centers (name, address, capacity, contact_person, contact_number, facilities, location_lat, location_lng) VALUES 
('Barangay Malagutay Hall', 'Barangay Malagutay, Pasig City', 200, 'Barangay Captain', '09123456789', 'Restrooms, Kitchen, Medical Station', 14.5995, 121.0537),
('Malagutay Elementary School', 'Sitio Centro, Barangay Malagutay', 150, 'School Principal', '09123456790', 'Classrooms, Restrooms, Playground', 14.5990, 121.0530),
('Community Center', 'Sitio Riverside, Barangay Malagutay', 100, 'Community Leader', '09123456791', 'Hall, Kitchen, Storage', 14.6010, 121.0550);

-- Insert emergency contacts
INSERT INTO emergency_contacts (organization, contact_person, phone_number, email, service_type, available_24h, address) VALUES 
('Philippine National Police', 'Duty Officer', '117', NULL, 'police', TRUE, 'Pasig City Police Station'),
('Bureau of Fire Protection', 'Fire Marshall', '116', NULL, 'fire', TRUE, 'Pasig Fire Station'),
('Philippine Red Cross', 'Emergency Response Team', '143', 'emergency@redcross.org.ph', 'rescue', TRUE, 'Pasig Chapter'),
('Pasig City Disaster Risk Reduction', 'DRRM Officer', '09123456792', 'drrm@pasig.gov.ph', 'rescue', TRUE, 'Pasig City Hall'),
('Maynila Water', 'Emergency Hotline', '1627', 'emergency@maynilawater.com.ph', 'utilities', TRUE, 'Various Locations'),
('Meralco', 'Power Outage Hotline', '16211', 'emergency@meralco.com.ph', 'utilities', TRUE, 'Various Locations');

-- Insert sample alert for testing
INSERT INTO alerts (title, message, alert_type, severity, created_by) VALUES 
('System Test Alert', 'This is a test alert to verify the emergency notification system is working properly. Please disregard.', 'general', 'watch', 1);

-- Create views for easier reporting
CREATE VIEW active_rescue_requests AS
SELECT 
    r.*,
    u.username as assigned_responder_name
FROM rescue_requests r
LEFT JOIN users u ON r.assigned_responder = u.id
WHERE r.status IN ('pending', 'acknowledged', 'in_progress');

CREATE VIEW recent_alerts AS
SELECT 
    a.*,
    u.username as created_by_name
FROM alerts a
JOIN users u ON a.created_by = u.id
WHERE a.active = TRUE
ORDER BY a.created_at DESC;

-- Create stored procedure for rescue request statistics
DELIMITER //
CREATE PROCEDURE GetRescueStatistics(IN date_range INT)
BEGIN
    SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_requests,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_requests,
        SUM(CASE WHEN emergency_type = 'medical' THEN 1 ELSE 0 END) as medical_emergencies,
        SUM(CASE WHEN emergency_type = 'trapped' THEN 1 ELSE 0 END) as trapped_emergencies,
        SUM(CASE WHEN emergency_type = 'evacuation' THEN 1 ELSE 0 END) as evacuation_requests
    FROM rescue_requests 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL date_range DAY);
END //
DELIMITER ;

-- Create trigger to log rescue request status changes
DELIMITER //
CREATE TRIGGER rescue_request_status_log 
AFTER UPDATE ON rescue_requests
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO activity_logs (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (
            NEW.assigned_responder,
            'status_change',
            'rescue_requests',
            NEW.id,
            JSON_OBJECT('status', OLD.status),
            JSON_OBJECT('status', NEW.status)
        );
        
        -- Set completed_at timestamp when status changes to completed
        IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
            UPDATE rescue_requests SET completed_at = NOW() WHERE id = NEW.id;
        END IF;
    END IF;
END //
DELIMITER ;

-- Indexes for better performance
CREATE INDEX idx_rescue_requests_compound ON rescue_requests(status, emergency_type, created_at);
CREATE INDEX idx_alerts_compound ON alerts(active, alert_type, created_at);
CREATE INDEX idx_users_login ON users(username, active);

-- Full-text search indexes for better search functionality
ALTER TABLE rescue_requests ADD FULLTEXT(name, address, description);
ALTER TABLE alerts ADD FULLTEXT(title, message);

COMMIT;
