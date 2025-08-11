# BantayBarangay Malagutay
### Mobile-First Disaster Response Platform

A comprehensive emergency response and disaster management system designed specifically for Barangay Malagutay. Built with vanilla web technologies for maximum compatibility and offline functionality.

## 🚨 Features

### Core Functionality
- **Emergency Rescue Requests** - Submit rescue requests with GPS location
- **Real-time Alerts** - Community-wide emergency notifications
- **Interactive Map** - Visual incident tracking and safe zone mapping
- **Role-based Access** - Admin, Official, Resident, and Responder roles
- **Offline Support** - Works without internet connection
- **Mobile-First Design** - Optimized for smartphones and tablets
- **SMS Notifications** - Automated emergency alerts via SMS

### User Roles
- **Residents** - Submit rescue requests, view alerts, access emergency info
- **Officials** - Create alerts, manage rescue operations, view reports
- **Responders** - Update rescue status, coordinate with officials
- **Admin** - Full system access, user management, system configuration

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **CSS Framework**: Bootstrap 5 (CDN)
- **Backend**: PHP 8+ with MySQLi
- **Database**: MySQL
- **Development**: XAMPP
- **PWA Features**: Service Worker, Web App Manifest
- **Maps**: Google Maps API integration

## 📋 Prerequisites

- XAMPP (PHP 8.0+, MySQL, Apache)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Google Maps API key (optional, for map functionality)
- SMS API credentials (optional, for notifications)

## 🚀 Installation

### 1. Setup XAMPP
1. Download and install [XAMPP](https://www.apachefriends.org/)
2. Start Apache and MySQL services

### 2. Clone/Download Project
```bash
# Option 1: Clone repository
git clone https://github.com/deanbilledo/bantay-barangay.git

# Option 2: Download and extract to XAMPP htdocs folder
# Place in: C:\xampp\htdocs\bantay-barangay\
```

### 3. Database Setup
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Import the database schema:
   - Click "Import" tab
   - Choose file: `database_schema.sql`
   - Click "Go"

### 4. Configuration
1. Edit `config/config.php`:
   ```php
   // SMS API Configuration (Semaphore)
   define('SMS_API_KEY', 'your_semaphore_api_key_here');
   
   // Email Configuration
   define('SMTP_USERNAME', 'your_email@gmail.com');
   define('SMTP_PASSWORD', 'your_app_password');
   ```

2. Edit `pages/map.php`:
   ```javascript
   // Replace with your Google Maps API key
   src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap"
   ```

### 5. Access the Application
- **URL**: http://localhost/bantay-barangay/
- **Default Admin Login**:
  - Username: `admin`
  - Password: `password` (⚠️ Change this immediately!)

## 📱 Mobile Installation (PWA)

1. Open the website in Chrome/Edge mobile browser
2. Tap "Add to Home Screen" when prompted
3. The app will install as a native-like application
4. Works offline with cached data

## 🔧 Configuration Options

### SMS API Setup (Semaphore)
1. Register at [Semaphore](https://semaphore.co/)
2. Get your API key
3. Update `SMS_API_KEY` in `config/config.php`

### Email Notifications
1. Enable 2-factor authentication on Gmail
2. Generate an app password
3. Update email settings in `config/config.php`

### Google Maps API
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API
3. Update the script tag in `pages/map.php`

## 📊 Default Users

| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| admin | password | Admin | System administration |

**⚠️ Important**: Change the default password immediately after installation!

## 🗺 Barangay Malagutay Configuration

The system is pre-configured for Barangay Malagutay with:
- Emergency contact numbers
- Evacuation center locations
- Sample safe zones
- Local area coordinates

### Updating Location Data
Edit the following files to customize for your area:
- `pages/map.php` - Update coordinates and map center
- `database_schema.sql` - Update evacuation centers and contacts

## 📁 File Structure

```
bantay-barangay/
├── index.php                 # Landing page
├── login.php                 # User authentication
├── register.php              # User registration
├── logout.php                # Session cleanup
├── manifest.json             # PWA manifest
├── sw.js                     # Service worker
├── database_schema.sql       # Database setup
├── config/
│   ├── database.php          # Database connection
│   └── config.php            # App configuration
├── includes/
│   ├── header.php            # Common header
│   ├── footer.php            # Common footer
│   └── functions.php         # Utility functions
├── pages/
│   ├── dashboard.php         # User dashboard
│   ├── rescue-form.php       # Emergency request form
│   ├── alerts.php            # Alert management
│   ├── map.php               # Interactive map
│   └── reports.php           # Analytics & reports
├── api/
│   ├── get-alerts.php        # Alert API
│   ├── get-rescue-requests.php # Rescue API
│   └── create-alert.php      # Alert creation
└── assets/
    ├── css/style.css         # Custom styles
    └── js/                   # JavaScript modules
```

## 🔒 Security Features

- Password hashing with PHP's `password_hash()`
- SQL injection protection via prepared statements
- CSRF token validation
- Input sanitization
- Role-based access control
- Session management

## 📱 Offline Functionality

The app works offline through:
- Service Worker caching
- Local Storage for form data
- Background sync for submissions
- Cached map data
- Offline alert viewing

## 🚑 Emergency Contacts

Pre-configured emergency numbers:
- **National Emergency**: 117
- **Fire**: 116
- **Medical**: 143
- **Barangay Hotline**: Configure in `config/config.php`

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL service is running
   - Verify database credentials in `config/database.php`

2. **SMS Not Sending**
   - Verify Semaphore API key
   - Check internet connection
   - Validate phone number format

3. **Map Not Loading**
   - Add Google Maps API key
   - Check browser console for errors
   - Verify API key permissions

4. **Offline Features Not Working**
   - Enable HTTPS (required for service workers)
   - Check browser compatibility
   - Clear browser cache

### Development Mode

For development with local SSL:
```bash
# Use XAMPP with SSL or local development server with HTTPS
# Service Workers require HTTPS in production
```

## 📞 Support

For technical support or questions:
- Create an issue on GitHub
- Contact: deanbilledo@example.com
- Emergency: Call local emergency services

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🏥 Emergency Usage

### For Residents:
1. **Emergency**: Call 117 immediately
2. **Rescue Request**: Use the app to submit detailed requests
3. **Stay Connected**: Monitor alerts regularly
4. **Offline**: App works without internet

### For Officials:
1. **Create Alerts**: Use dashboard to broadcast warnings
2. **Monitor Requests**: Track and assign rescue operations
3. **Coordinate**: Manage resources and responders
4. **Report**: Generate analytics and reports

---

**⚠️ Disclaimer**: This system is designed to supplement, not replace, official emergency services. Always call emergency hotlines for life-threatening situations.
