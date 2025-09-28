# 🔥 Firebase Setup Guide for Agri Monitor

## 📋 Firebase Project Setup Steps

### 1. **Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `agri-monitor-app`
4. Enable Google Analytics (recommended)
5. Click **"Create project"**

### 2. **Enable Authentication**
1. In Firebase Console, go to **Authentication**
2. Click **"Get started"**
3. Go to **Sign-in method** tab
4. Enable **Phone** authentication
5. Configure your phone number for testing (optional)

### 3. **Android Configuration**

#### **Add Android App:**
1. In Firebase Console, click **"Add app"** → **Android**
2. Enter details:
   - **Android package name**: `com.example.agri_monitor`
   - **App nickname**: `Agri Monitor Android`
   - **Debug signing certificate SHA-1**: (optional for now)
3. Click **"Register app"**

#### **Download Configuration File:**
1. Download `google-services.json`
2. Place it in `android/app/google-services.json`

#### **Update Android Files:**

**File: `android/build.gradle`** (project-level)
```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

**File: `android/app/build.gradle`**
```gradle
// Add at the top after other plugins
apply plugin: 'com.google.gms.google-services'

android {
    compileSdkVersion 34

    defaultConfig {
        minSdkVersion 21  // Firebase Auth requires min SDK 21
        targetSdkVersion 34
        multiDexEnabled true
    }
}

dependencies {
    implementation 'com.android.support:multidex:1.0.3'
}
```

### 4. **iOS Configuration**

#### **Add iOS App:**
1. In Firebase Console, click **"Add app"** → **iOS**
2. Enter details:
   - **iOS bundle ID**: `com.example.agriMonitor`
   - **App nickname**: `Agri Monitor iOS`
3. Click **"Register app"**

#### **Download Configuration File:**
1. Download `GoogleService-Info.plist`
2. Open Xcode project: `ios/Runner.xcworkspace`
3. Right-click on `Runner` in project navigator
4. Select **"Add Files to Runner"**
5. Select `GoogleService-Info.plist`
6. Ensure **"Copy items if needed"** is checked
7. Select **Runner** target
8. Click **"Add"**

#### **Update iOS Files:**

**File: `ios/Runner/Info.plist`**
```xml
<!-- Add before </dict> -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>REVERSED_CLIENT_ID</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>YOUR_REVERSED_CLIENT_ID_HERE</string>
        </array>
    </dict>
</array>
```

### 5. **Web Configuration** (if needed)

1. In Firebase Console, click **"Add app"** → **Web**
2. Enter app nickname: `Agri Monitor Web`
3. Copy the Firebase config object
4. Update `web/index.html` with Firebase SDK scripts

## 🚀 Quick Start Commands

After setting up Firebase project and downloading config files:

```bash
# Update Android configuration
flutter clean
flutter pub get

# For iOS (Mac only)
cd ios
pod install
cd ..

# Run the app
flutter run
```

## 📱 Phone Authentication Setup

### **Test Phone Numbers** (for development)
In Firebase Console → Authentication → Sign-in method → Phone:

Add test phone numbers:
```
Phone: +1 650-555-1234
Code: 123456

Phone: +91 98765 43210  
Code: 654321
```

## 🔒 Security Rules

### **Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public crop data
    match /crops/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## ⚠️ Important Notes

1. **For Production**: Replace test phone numbers with real verification
2. **API Keys**: Keep Firebase config files secure and don't commit sensitive keys
3. **Billing**: Enable Blaze plan for production usage (phone auth requires it)
4. **Testing**: Use Firebase Auth Emulator for local testing

## 🆘 Common Issues

### **Android Build Issues:**
```bash
# Clean and rebuild
flutter clean
flutter pub get
cd android
./gradlew clean
cd ..
flutter run
```

### **iOS Build Issues:**
```bash
# Clean iOS build
cd ios
pod deintegrate
pod install
cd ..
flutter clean
flutter run
```

### **"Firebase project not found" Error:**
- Ensure `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) is in the correct location
- Check that the package name matches exactly

## 📞 Support

- **Firebase Documentation**: https://firebase.google.com/docs/flutter/setup
- **Phone Auth Guide**: https://firebase.google.com/docs/auth/flutter/phone-auth
- **Troubleshooting**: https://firebase.google.com/docs/flutter/setup#available-plugins