# 🔗 API Configuration Guide for Agri Monitor Platform

This document lists all APIs, URLs, and configurations needed to make the Agri Monitor platform fully functional in production.

## 📱 Mobile Application APIs

### 1. **SMS/OTP Service APIs**

#### **Option 1: Fast2SMS (Recommended for India)**
```dart
// File: lib/core/services/otp_service_enhanced.dart
static const String _fast2smsUrl = 'https://www.fast2sms.com/dev/bulk';
static const String _fast2smsApiKey = 'YOUR_FAST2SMS_API_KEY';
```

**Setup Steps:**
1. Sign up at: https://www.fast2sms.com/
2. Get API key from dashboard
3. Replace `YOUR_FAST2SMS_API_KEY` with your actual API key
4. Minimum balance required: ₹100

**Pricing:** ₹0.15 per SMS

#### **Option 2: TextLocal**
```dart
// File: lib/core/services/otp_service_enhanced.dart
static const String _smsServiceUrl = 'https://api.textlocal.in/send/';
static const String _apiKey = 'YOUR_TEXTLOCAL_API_KEY';
static const String _sender = 'AGRIMO'; // Your sender ID
```

**Setup Steps:**
1. Sign up at: https://www.textlocal.in/
2. Get API key and sender ID
3. Replace placeholders with actual values

**Pricing:** ₹0.25 per SMS

#### **Option 3: Twilio (International)**
```dart
// File: lib/core/services/otp_service_enhanced.dart
static const String _twilioUrl = 'https://api.twilio.com/2010-04-01/Accounts/';
static const String _twilioSid = 'YOUR_TWILIO_SID';
static const String _twilioToken = 'YOUR_TWILIO_TOKEN';
```

**Setup Steps:**
1. Sign up at: https://www.twilio.com/
2. Get Account SID and Auth Token
3. Buy a Twilio phone number
4. Replace placeholders with actual values

**Pricing:** $0.0075 per SMS

### 2. **Backend API Configuration**

#### **Main Backend URL**
```dart
// File: lib/core/constants/app_constants.dart
static const String baseUrl = 'https://your-domain.com/api';
```

**Required Endpoints to implement on your backend:**

#### **Authentication Endpoints**
```
POST /auth/register - User registration
POST /auth/login - User login  
POST /auth/send-otp - Send OTP
POST /auth/verify-otp - Verify OTP
GET /auth/profile - Get user profile
PATCH /auth/update-language - Update language
POST /auth/logout - User logout
POST /auth/refresh-token - Refresh auth token
```

#### **Image Analysis Endpoints**
```
POST /analysis/upload - Upload image for analysis
GET /analysis/{id} - Get analysis result
GET /analysis/history - Get analysis history
POST /analysis/compare - Compare multiple analyses
DELETE /analysis/{id} - Delete analysis
```

#### **Environmental Data Endpoints**
```
GET /environmental/current - Current environmental data
GET /environmental/history - Environmental history
GET /environmental/forecasts - Weather forecasts
POST /environmental/alerts - Create environmental alerts
```

#### **Alert Management Endpoints**
```
GET /alerts - Get user alerts
POST /alerts - Create new alert
PUT /alerts/{id} - Update alert
DELETE /alerts/{id} - Delete alert
GET /alerts/types - Get alert types
```

#### **Crop Management Endpoints**
```
GET /crops - Get crop types
POST /crops - Add new crop
GET /crops/{id}/diseases - Get crop diseases
GET /crops/{id}/treatments - Get treatments
```

### 3. **Map and Location Services**

#### **Google Maps API (For location services)**
```dart
// File: pubspec.yaml - Add dependency
google_maps_flutter: ^2.5.0

// Add to android/app/src/main/AndroidManifest.xml
<meta-data android:name="com.google.android.geo.API_KEY"
           android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```

**Setup Steps:**
1. Go to: https://console.cloud.google.com/
2. Enable Maps SDK for Android/iOS
3. Create API key
4. Add billing information

#### **Weather API**
```dart
// File: lib/features/environmental/repository/environmental_repository.dart
static const String weatherApiUrl = 'https://api.openweathermap.org/data/2.5';
static const String weatherApiKey = 'YOUR_OPENWEATHER_API_KEY';
```

**Setup Steps:**
1. Sign up at: https://openweathermap.org/api
2. Get free API key
3. Replace `YOUR_OPENWEATHER_API_KEY`

### 4. **Push Notifications**

#### **Firebase Cloud Messaging**
```dart
// File: pubspec.yaml
firebase_core: ^2.24.2
firebase_messaging: ^14.7.10
```

**Setup Steps:**
1. Go to: https://console.firebase.google.com/
2. Create new project
3. Add Android/iOS apps
4. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
5. Add to respective platform folders

#### **OneSignal (Alternative)**
```dart
// File: pubspec.yaml
onesignal_flutter: ^5.0.2

// Initialize with your app ID
static const String oneSignalAppId = 'YOUR_ONESIGNAL_APP_ID';
```

### 5. **File Storage APIs**

#### **AWS S3 Configuration**
```dart
// File: lib/core/services/file_storage_service.dart
static const String awsBucket = 'your-bucket-name';
static const String awsRegion = 'us-east-1';
static const String awsAccessKey = 'YOUR_AWS_ACCESS_KEY';
static const String awsSecretKey = 'YOUR_AWS_SECRET_KEY';
```

#### **Firebase Storage (Alternative)**
```dart
// File: pubspec.yaml
firebase_storage: ^11.6.0

// No additional configuration needed if using Firebase
```

## 🌐 Website APIs

### 1. **Backend API URLs**

#### **Main Configuration**
```javascript
// File: website/src/config/api.js
export const API_BASE_URL = 'https://your-domain.com/api';
export const WS_BASE_URL = 'wss://your-domain.com/ws';
```

#### **Authentication APIs**
```javascript
// File: website/src/services/authService.js
const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
  REFRESH: '/auth/refresh'
};
```

### 2. **Map Services for Website**

#### **Mapbox (Recommended)**
```javascript
// File: website/src/components/Map.js
const MAPBOX_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN';
const MAPBOX_STYLE = 'mapbox://styles/mapbox/satellite-v9';
```

**Setup Steps:**
1. Sign up at: https://www.mapbox.com/
2. Get access token
3. Replace `YOUR_MAPBOX_ACCESS_TOKEN`

#### **Google Maps (Alternative)**
```javascript
// File: website/public/index.html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"></script>
```

### 3. **Real-time Communication**

#### **Socket.IO Configuration**
```javascript
// File: website/src/services/socketService.js
const SOCKET_URL = 'https://your-domain.com';
const SOCKET_OPTIONS = {
  transports: ['websocket', 'polling']
};
```

### 4. **External Data APIs**

#### **Satellite Imagery API**
```javascript
// File: website/src/services/satelliteService.js
const SENTINEL_API_URL = 'https://scihub.copernicus.eu/dhus/search';
const SENTINEL_USERNAME = 'YOUR_SENTINEL_USERNAME';
const SENTINEL_PASSWORD = 'YOUR_SENTINEL_PASSWORD';
```

**Setup Steps:**
1. Register at: https://scihub.copernicus.eu/dhus/
2. Get credentials for Sentinel satellite data

#### **Agricultural Data APIs**
```javascript
// File: website/src/services/dataService.js
const AGRI_DATA_APIS = {
  SOIL_DATA: 'https://rest.soilgrids.org/soilgrids/v2.0/classification/query',
  WEATHER_DATA: 'https://api.openweathermap.org/data/2.5',
  CROP_CALENDAR: 'https://cropcalendar.apps.fao.org/api'
};
```

## 🗄️ Database Configuration

### 1. **Production Database**

#### **PostgreSQL (Recommended)**
```env
# File: .env
DATABASE_URL=postgresql://username:password@your-db-host:5432/agri_monitor_db
DB_HOST=your-db-host.com
DB_PORT=5432
DB_NAME=agri_monitor_db
DB_USER=your_db_username
DB_PASSWORD=your_db_password
```

#### **MongoDB (Alternative)**
```env
# File: .env
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/agri_monitor?retryWrites=true&w=majority
```

### 2. **Redis for Caching**
```env
# File: .env
REDIS_URL=redis://username:password@your-redis-host:6379
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

## ☁️ Cloud Infrastructure

### 1. **AWS Services**

#### **EC2 Instance**
- Instance Type: t3.medium or higher
- Storage: 20GB+ SSD
- Security Groups: HTTP (80), HTTPS (443), SSH (22)

#### **RDS Database**
- Engine: PostgreSQL 14+
- Instance Class: db.t3.micro for testing, db.t3.small for production
- Multi-AZ: Yes for production

#### **S3 Bucket**
- Bucket Name: `agri-monitor-files`
- Region: Same as EC2 instance
- Public Access: Blocked (use signed URLs)

### 2. **Domain and SSL**

#### **Domain Configuration**
```
Main Website: https://agrimonitor.com
API Endpoint: https://api.agrimonitor.com
Admin Panel: https://admin.agrimonitor.com
```

#### **SSL Certificate**
- Use Let's Encrypt for free SSL
- Or AWS Certificate Manager if using CloudFront

## 🔧 Environment Variables

### **Backend Environment (.env)**
```env
# Database
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url

# API Keys
FAST2SMS_API_KEY=your_fast2sms_key
OPENWEATHER_API_KEY=your_weather_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_BUCKET=your_s3_bucket

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d

# App Settings
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://agrimonitor.com

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

### **Frontend Environment (.env)**
```env
# API
REACT_APP_API_BASE_URL=https://api.agrimonitor.com
REACT_APP_WS_URL=wss://api.agrimonitor.com

# Maps
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_key

# Analytics
REACT_APP_GA_TRACKING_ID=your_ga_id
```

## 📊 Analytics and Monitoring

### **Google Analytics**
```javascript
// File: website/src/index.js
const GA_TRACKING_ID = 'YOUR_GA_TRACKING_ID';
```

### **Sentry for Error Monitoring**
```javascript
// File: website/src/index.js
const SENTRY_DSN = 'YOUR_SENTRY_DSN';
```

## 🚀 Deployment Checklist

### **Pre-deployment Steps:**
1. ✅ Replace all placeholder API keys
2. ✅ Set up production database
3. ✅ Configure domain and SSL
4. ✅ Set up monitoring and logging
5. ✅ Test all API endpoints
6. ✅ Configure backup strategies
7. ✅ Set up CI/CD pipeline

### **Security Checklist:**
1. ✅ Enable HTTPS everywhere
2. ✅ Use strong JWT secrets
3. ✅ Implement rate limiting
4. ✅ Set up CORS properly
5. ✅ Use environment variables for secrets
6. ✅ Enable database encryption
7. ✅ Set up proper backup retention

## 💰 Estimated Monthly Costs

### **Development/Testing:**
- SMS (Fast2SMS): ₹500/month
- Weather API: Free tier
- Database (AWS RDS): $15/month
- Server (AWS EC2): $10/month
- **Total: ~$30/month (₹2,500)**

### **Production (1000+ users):**
- SMS: ₹2,000/month
- Weather API: $40/month
- Database: $50/month
- Server: $100/month
- Storage: $20/month
- **Total: ~$250/month (₹20,000)**

## 📞 Support and Resources

### **API Documentation:**
- Fast2SMS: https://docs.fast2sms.com/
- Twilio: https://www.twilio.com/docs/
- OpenWeather: https://openweathermap.org/api
- Google Maps: https://developers.google.com/maps/documentation
- Mapbox: https://docs.mapbox.com/

### **Free Credits:**
- AWS: $300 free credits for new accounts
- Google Cloud: $300 free credits
- Azure: $200 free credits
- Twilio: $10 free credit
- OpenWeather: Free tier with 1000 calls/day

This configuration guide will make your Agri Monitor platform fully functional in production! 🚀