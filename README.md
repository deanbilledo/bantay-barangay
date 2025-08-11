# BantayBarangay Malagutay - Disaster Response Platform

![BantayBarangay Logo](https://img.shields.io/badge/BantayBarangay-Malagutay-blue?style=for-the-badge&logo=emergency&logoColor=white)

A comprehensive **mobile-first disaster response web platform** specifically designed for **Barangay Malagutay, Loon, Bohol**. This system helps barangay officials coordinate rescue operations, aid distribution, and emergency communications during natural disasters.

## 🌟 Features

### 🚨 Emergency Management
- **Real-time Rescue Requests** with GPS location and photo uploads
- **Alert Broadcasting System** with SMS, email, and push notifications  
- **Live Incident Mapping** with evacuation routes and safe zones
- **Aid Distribution Tracking** to prevent duplicate assistance

### 👥 User Roles
- **Barangay Officials**: Create alerts, manage operations, coordinate aid
- **Residents**: Submit rescue requests, receive alerts, view safety info
- **Responders**: View rescue queue, update operation status
- **Admins**: Full system management and user administration

### 📱 Mobile-First Design
- **Progressive Web App (PWA)** with offline capabilities
- **Touch-friendly interface** optimized for smartphones
- **Works on low-end Android devices** with slow networks
- **Offline form submission** with background sync

### 🔄 Real-time Updates
- **Socket.io integration** for live notifications
- **Real-time rescue request status** updates
- **Live alert broadcasting** to all residents
- **Connection status indicators** with auto-reconnection

## 🛠️ Tech Stack

### Frontend
- **React 18+** with Vite for fast development
- **Tailwind CSS** for modern, responsive design
- **React Router** for navigation
- **React Query** for server state management
- **Framer Motion** for smooth animations
- **Socket.io Client** for real-time features

### Backend
- **Node.js 18+** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for secure authentication
- **Multer & Sharp** for file upload and processing

### Development & Deployment
- **Vite** for fast development builds
- **ESLint & Prettier** for code quality
- **Jest & Vitest** for testing
- **Docker** ready for containerization
- **Hostinger** deployment ready

## 🚀 Quick Start

### Prerequisites

```bash
# Required software
Node.js 18+ (Download from https://nodejs.org/)
MongoDB Community Server (Download from https://www.mongodb.com/try/download/community)
Git (Download from https://git-scm.com/)
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/deanbilledo/bantay-barangay.git
cd bantay-barangay
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**

Create `.env` file in the `server` directory:
```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/bantay_barangay_malagutay

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# SMS Configuration (Semaphore API)
SMS_API_KEY=your-semaphore-api-key
SMS_SENDER_NAME=BantayBarangay

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Create `.env` file in the `client` directory:
```bash
# Client environment
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. **Start MongoDB**
```bash
# Windows (if MongoDB is installed as service)
net start MongoDB

# macOS/Linux
mongod

# Or use MongoDB Atlas cloud database
```

5. **Start the development servers**
```bash
# Start both client and server
npm run dev

# Or start them separately
npm run client  # React dev server (port 3000)
npm run server  # Express server (port 5000)
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 📱 PWA Installation

### Android Devices
1. Open the app in Chrome browser
2. Tap the "Add to Home Screen" prompt
3. Or go to Chrome menu → "Add to Home Screen"

### iOS Devices
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Desktop
1. Look for the install icon in the address bar
2. Or use Chrome menu → "Install BantayBarangay..."

## 🗃️ Database Setup

### Local MongoDB
```bash
# Start MongoDB service
mongod --dbpath /path/to/your/data

# Create database and initial admin user (optional)
mongo
use bantay_barangay_malagutay
db.createUser({
  user: "admin",
  pwd: "password",
  roles: ["readWrite", "dbAdmin"]
})
```

### MongoDB Atlas (Cloud)
1. Create account at https://cloud.mongodb.com
2. Create new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Seed Initial Data (Optional)
```bash
cd server
npm run seed
```

## 🔧 Development Scripts

```bash
# Root level commands
npm run dev          # Start both client and server
npm run build        # Build for production
npm run test         # Run all tests
npm run lint         # Lint all code
npm run clean        # Clean node_modules

# Client specific
cd client
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests

# Server specific
cd server
npm run dev          # Start with nodemon
npm run start        # Start production server
npm test             # Run tests
npm run seed         # Seed database
```

## 🧪 Testing

### Unit & Integration Tests
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### E2E Testing (Cypress)
```bash
# Interactive mode
npm run cypress:open

# Headless mode
npm run cypress:run
```

### Mobile Testing
- Use Chrome DevTools device simulation
- Test on real devices via network IP: `http://[your-ip]:3000`
- Test PWA functionality with Lighthouse

## 📊 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # Register new user
POST /api/auth/login        # Login user
POST /api/auth/logout       # Logout user
GET  /api/auth/me           # Get current user
PUT  /api/auth/profile      # Update profile
```

### Rescue Request Endpoints
```
GET    /api/rescue-requests           # Get all requests
POST   /api/rescue-requests           # Create new request
GET    /api/rescue-requests/:id       # Get specific request
PUT    /api/rescue-requests/:id       # Update request
PATCH  /api/rescue-requests/:id/status # Update status
DELETE /api/rescue-requests/:id       # Delete request
```

### Alert Endpoints
```
GET    /api/alerts          # Get all alerts
POST   /api/alerts          # Create new alert
PATCH  /api/alerts/:id/publish # Publish alert
GET    /api/alerts/active   # Get active alerts
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build

# Build will be created in client/dist
```

### Environment Variables (Production)
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-super-secure-production-jwt-secret
CLIENT_URL=https://yourdomain.com
```

### Hostinger Deployment
1. Upload built files to public_html
2. Set up Node.js app in Hostinger panel
3. Configure environment variables
4. Set up MongoDB Atlas or external database

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t bantay-barangay .
docker run -p 5000:5000 bantay-barangay
```

## 🔐 Security Features

- **JWT Authentication** with secure HTTP-only cookies
- **Input Validation** with express-validator
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **XSS Protection** with helmet and sanitization
- **Password Hashing** with bcrypt (12 rounds)
- **File Upload Security** with type and size validation

## 📱 SMS Integration (Philippines)

### Recommended SMS Providers
1. **Semaphore SMS API** - ₱0.60/SMS
   ```javascript
   SMS_API_KEY=your-semaphore-api-key
   SMS_SENDER_NAME=BantayBarangay
   ```

2. **Twilio** - $0.06/SMS (~₱3.30)
3. **Infobip** - Competitive bulk rates

### Setup Semaphore API
1. Register at https://semaphore.co/
2. Get API key from dashboard
3. Add to environment variables
4. Test with development mode

## 🗺️ Map Integration

### Leaflet Configuration
- Default center: Barangay Malagutay (9.8063°N, 123.8014°E)
- Offline map tiles cached with service worker
- Geolocation API for automatic positioning
- Custom markers for incidents and evacuation centers

## 📧 Email Configuration

### Gmail SMTP Setup
1. Enable 2-factor authentication
2. Generate app password
3. Use in EMAIL_PASS environment variable

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

## 🔄 Real-time Features

### Socket.io Events
```javascript
// Client-side listeners
socket.on('new-rescue-request', handleNewRequest)
socket.on('alert-broadcast', handleAlert)
socket.on('request-status-update', handleStatusUpdate)

// Server-side emitters
io.emit('alert-broadcast', alertData)
io.to(userId).emit('notification', notificationData)
```

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB service
sudo systemctl start mongod
```

**Port Already in Use**
```bash
# Kill process on port 3000/5000
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

**PWA Not Installing**
- Ensure HTTPS in production
- Check service worker registration
- Verify manifest.json is accessible

**SMS Not Sending**
- Verify API key is correct
- Check SMS provider balance
- Ensure phone numbers are in correct format

## 📝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style
- Use ESLint and Prettier configurations
- Follow React hooks best practices
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Barangay Malagutay Officials** for requirements and feedback
- **Local Residents** for user testing and suggestions
- **Open Source Community** for the amazing tools and libraries

## 📞 Support

For support and questions:
- **Email**: support@bantaybarangay.com
- **Issues**: Create an issue on GitHub
- **Documentation**: Visit our wiki

---

**Made with ❤️ for Barangay Malagutay, Loon, Bohol**

*Helping communities prepare, respond, and recover from disasters through technology.*
