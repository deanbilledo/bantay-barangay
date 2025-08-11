# 🚨 BantayBarangay Malagutay
### Emergency Response & Disaster Management System

A comprehensive mobile-first disaster response platform designed specifically for **Barangay Malagutay, Pasig City**. Built with vanilla web technologies for maximum compatibility, offline functionality, and emergency reliability.

![Platform Overview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![PHP Version](https://img.shields.io/badge/PHP-8.0%2B-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 **Emergency Features**

### 🆘 **Immediate Response**
- **Emergency Rescue Requests** - GPS-enabled rescue form with photo upload
- **Real-time SMS Alerts** - Automated community notifications  
- **Interactive Emergency Map** - Live incident tracking with safe zones
- **Offline Emergency Mode** - Works without internet connection
- **24/7 Emergency Contacts** - Quick access to all emergency services

### 👥 **Community Management**
- **Role-Based Access** - Admin, Officials, Residents, Responders
- **Aid Distribution Tracking** - Prevent duplicate relief distribution
- **Evacuation Center Management** - Real-time capacity monitoring
- **Activity Logging** - Complete audit trail of all actions

### 📱 **Mobile-First Design**
- **Progressive Web App (PWA)** - Install like a native app
- **Touch-Optimized Interface** - 44px minimum touch targets
- **Responsive Design** - Works on all devices (320px to desktop)
- **Low-Bandwidth Optimized** - Fast loading on slow connections

---

## 🛠 **Technology Stack**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | HTML5, CSS3, JavaScript ES6+ | Core web technologies |
| **UI Framework** | Bootstrap 5 (CDN) | Responsive design |
| **Backend** | PHP 8+ with MySQLi | Server-side processing |
| **Database** | MySQL with optimized schema | Data storage |
| **PWA** | Service Worker + Web Manifest | Offline functionality |
| **Maps** | Google Maps JavaScript API | Location services |
| **SMS** | Semaphore API | Emergency notifications |
| **Development** | XAMPP | Local development environment |

---

## 🚀 **Quick Start Guide**

### **Prerequisites**
- [XAMPP](https://www.apachefriends.org/) (PHP 8.0+, MySQL, Apache)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- *(Optional)* Google Maps API key
- *(Optional)* Semaphore SMS API credentials

### **Installation Steps**

#### 1. **Setup XAMPP**
```bash
# Download and install XAMPP
# Start Apache and MySQL services from XAMPP Control Panel
```

#### 2. **Database Setup**
```sql
-- 1. Open phpMyAdmin (http://localhost/phpmyadmin)
-- 2. Create new database: bantay_malagutay
-- 3. Import database_schema.sql file
-- 4. Default admin login will be created
```

#### 3. **Configure Application**
```php
// Edit config/config.php
define('SMS_API_KEY', 'your_semaphore_api_key');
define('SMTP_USERNAME', 'your_email@gmail.com');
define('SMTP_PASSWORD', 'your_app_password');
```

#### 4. **Access Application**
```
URL: http://localhost/bantay-barangay/
Admin Login: admin / password
⚠️ CHANGE DEFAULT PASSWORD IMMEDIATELY!
```

---

## 📁 **Project Structure**

```
bantay-barangay/
├── 📄 index.php                    # Landing page & public access
├── 🔐 login.php                    # User authentication
├── 👤 register.php                 # New user registration
├── 🚪 logout.php                   # Session cleanup
├── 📱 manifest.json                # PWA configuration
├── ⚙️ sw.js                        # Service worker (offline support)
├── 🗄️ database_schema.sql          # Complete database setup
│
├── 📂 config/
│   ├── database.php               # MySQL connection
│   └── config.php                 # App settings & API keys
│
├── 📂 includes/
│   ├── header.php                 # Common page header
│   ├── footer.php                 # Common page footer
│   └── functions.php              # Core utility functions
│
├── 📂 pages/
│   ├── dashboard.php              # User dashboard & stats
│   ├── rescue-form.php            # Emergency request form
│   ├── alerts.php                 # Alert management
│   ├── map.php                    # Interactive emergency map
│   └── reports.php                # Analytics & reporting
│
├── 📂 api/
│   ├── get-alerts.php             # Fetch alerts endpoint
│   ├── get-rescue-requests.php    # Fetch rescue requests
│   ├── create-alert.php           # Create new alert
│   └── submit-rescue.php          # Process rescue requests
│
└── 📂 assets/
    ├── css/style.css              # Custom emergency styling
    ├── js/rescue-form.js          # Emergency form logic
    ├── js/dashboard.js            # Dashboard interactions
    └── images/                    # Icons and images
```

---

## 👥 **User Roles & Permissions**

### 🔴 **Admin**
- Full system access and configuration
- User management and role assignment
- System settings and API configuration
- Complete reporting and analytics

### 🟡 **Barangay Official**
- Create and manage emergency alerts
- View all rescue requests and assign responders
- Access community reports and statistics
- Manage evacuation centers and aid distribution

### 🟢 **Resident**
- Submit emergency rescue requests
- View community alerts and announcements
- Access emergency contact information
- View evacuation centers and safe zones

### 🔵 **Emergency Responder**
- Update rescue request status
- View assigned emergency operations
- Access emergency protocols
- Coordinate with other responders

---

## 🚨 **Emergency Response Workflow**

### **For Residents in Emergency:**

1. **🚨 Immediate Danger**
   ```
   CALL 117 (National Emergency Hotline) FIRST!
   ```

2. **📱 Submit Rescue Request**
   - Open BantayBarangay app or website
   - Fill emergency request form
   - Enable GPS for accurate location
   - Upload photo if safe to do so
   - Submit request (works offline)

3. **📡 Automatic Notifications**
   - SMS sent to emergency responders
   - Request appears on official dashboard
   - Status updates sent to your phone

### **For Barangay Officials:**

1. **📊 Monitor Dashboard**
   - Real-time rescue request tracking
   - Community alert management
   - Resource allocation overview

2. **📢 Send Community Alerts**
   - Create emergency broadcasts
   - Set severity levels (Watch/Warning/Critical)
   - Automatic SMS to all residents

3. **👥 Coordinate Response**
   - Assign responders to requests
   - Track rescue operation status
   - Generate response reports

---

## 🌐 **API Configuration**

### **SMS Notifications (Semaphore)**
```php
// Get free API key: https://semaphore.co/
define('SMS_API_KEY', 'your_api_key_here');
define('SMS_SENDER_NAME', 'BANTAY_MALAGUTAY');
```

### **Google Maps Integration**
```javascript
// Get API key: https://console.cloud.google.com/
// Enable: Maps JavaScript API
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"></script>
```

### **Email Notifications**
```php
// Gmail with App Password
define('SMTP_USERNAME', 'barangay.malagutay@gmail.com');
define('SMTP_PASSWORD', 'your_16_character_app_password');
```

---

## 📱 **Progressive Web App (PWA)**

### **Installation on Mobile:**
1. Open website in Chrome/Safari mobile
2. Tap "Add to Home Screen" when prompted
3. App installs like native application
4. Works offline with cached data

### **Offline Features:**
- ✅ Submit rescue requests offline
- ✅ View cached emergency alerts
- ✅ Access emergency contact numbers
- ✅ GPS location capture
- ✅ Form data auto-save
- ✅ Background sync when online

---

## 🎨 **UI/UX Features**

### **Emergency Color Coding:**
- 🔴 **Critical Alerts** - Immediate action required
- 🟡 **Warning Alerts** - Prepare for potential danger  
- 🟢 **Watch Alerts** - Stay informed and ready
- 🔵 **General Info** - Community announcements

### **Mobile Optimizations:**
- Touch-friendly buttons (minimum 44px)
- Large, readable text for all ages
- Simple navigation with emergency focus
- Quick access to essential functions
- Battery-saving design choices

---

## 🗄️ **Database Schema**

### **Core Tables:**
```sql
users              # User accounts and roles
rescue_requests     # Emergency rescue submissions  
alerts             # Community emergency alerts
aid_distributions   # Relief goods tracking
evacuation_centers  # Safe zone management
emergency_contacts  # Important phone numbers
activity_logs       # System audit trail
sms_logs           # Message delivery tracking
```

### **Key Features:**
- Optimized indexes for fast emergency response
- Full-text search for quick information retrieval
- Automated logging triggers
- Statistical views for reporting
- Data relationships for integrity

---

## 🔒 **Security Measures**

### **Data Protection:**
- ✅ Password hashing with PHP `password_hash()`
- ✅ SQL injection prevention via prepared statements
- ✅ CSRF token validation on forms
- ✅ Input sanitization and validation
- ✅ Role-based access control
- ✅ Secure session management

### **Emergency Access:**
- Guest access for rescue requests (no login required)
- Offline data encryption
- Secure API endpoints
- Activity logging for accountability

---

## 🐛 **Troubleshooting Guide**

### **Common Issues & Solutions:**

#### **Database Connection Error**
```bash
# Check MySQL service in XAMPP
# Verify credentials in config/database.php
# Ensure database 'bantay_malagutay' exists
```

#### **SMS Not Sending**
```php
// Verify SMS_API_KEY in config/config.php
// Check Semaphore account balance
// Validate phone number format (+639xxxxxxxxx)
```

#### **Map Not Loading**
```javascript
// Add Google Maps API key
// Enable Maps JavaScript API in Google Console
// Check browser console for errors
```

#### **Offline Features Not Working**
```bash
# Enable HTTPS (required for Service Workers)
# Clear browser cache and storage
# Check browser compatibility (Chrome/Firefox/Safari/Edge)
```

#### **Path/Include Errors**
```php
// All paths use __DIR__ for absolute references
// Check file permissions (755 for directories, 644 for files)
// Verify XAMPP document root configuration
```

---

## 📊 **System Requirements**

### **Server Requirements:**
- **PHP**: 8.0 or higher
- **MySQL**: 5.7 or higher
- **Apache**: 2.4 or higher
- **Storage**: 100MB minimum
- **Memory**: 256MB PHP memory limit

### **Client Requirements:**
- **Browser**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **JavaScript**: ES6+ support required
- **Storage**: 50MB for offline cache
- **Network**: Works on 2G/3G/4G/WiFi

---

## 📞 **Emergency Contacts**

### **National Emergency Numbers:**
- **All Emergencies**: 911 / 117
- **Fire Bureau**: 116  
- **Philippine Red Cross**: 143
- **Coast Guard**: 998

### **Local Barangay Malagutay:**
- **Barangay Hall**: (Configure in config.php)
- **Health Center**: (Configure in config.php)
- **DRRM Office**: (Configure in config.php)

---

## 🤝 **Contributing**

We welcome contributions to improve emergency response for Barangay Malagutay!

### **How to Contribute:**
1. 🍴 Fork the repository
2. 🌱 Create feature branch (`git checkout -b feature/emergency-improvement`)
3. 💾 Commit changes (`git commit -m 'Add new emergency feature'`)
4. 📤 Push to branch (`git push origin feature/emergency-improvement`)
5. 🔄 Create Pull Request

### **Areas for Contribution:**
- 🗺️ Enhanced mapping features
- 📊 Advanced analytics and reporting
- 🌐 Multi-language support (Filipino/English)
- 📱 Native mobile app development
- 🤖 AI-powered emergency classification

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License - Free to use, modify, and distribute
Commercial use allowed with attribution
No warranty provided - use at your own risk
```

---

## 🏆 **Acknowledgments**

- **Barangay Malagutay Officials** - For emergency response requirements
- **Philippine DRRM Standards** - For compliance guidelines
- **Bootstrap Team** - For responsive UI framework
- **Google Maps** - For location services
- **Semaphore** - For SMS API services
- **Open Source Community** - For inspiration and tools

---

## ⚠️ **Important Disclaimers**

### **Emergency Usage:**
> ⚠️ **This system supplements but does not replace official emergency services.**  
> **For life-threatening emergencies, ALWAYS call 911 or 117 immediately.**

### **Data Privacy:**
> 🔒 **Emergency data is collected solely for disaster response purposes.**  
> **Location and contact information is shared only with authorized responders.**

### **System Reliability:**
> 🌐 **While designed for reliability, technology can fail during disasters.**  
> **Always have backup communication methods and emergency plans.**

---

## 📈 **Version History**

| Version | Date | Features Added |
|---------|------|----------------|
| 1.0.0 | Aug 2025 | Initial release with core emergency features |
| 1.1.0 | Planned | Enhanced mapping and analytics |
| 2.0.0 | Planned | Mobile app and advanced notifications |

---

**🚨 For Technical Support:** Create an issue on GitHub  
**📱 For Emergency Support:** Call 911 or your local emergency number  
**💬 For Barangay Concerns:** Contact Barangay Malagutay Hall

---

*Built with ❤️ for the safety and security of Barangay Malagutay residents*
