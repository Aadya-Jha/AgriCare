# 🚀 Android Emulator Setup Guide for Agri Monitor Mobile App

This guide will help you set up Flutter, Android SDK, and run the Agri Monitor mobile application on an Android emulator.

## 📋 Prerequisites Installation

### Step 1: Install Flutter

1. **Download Flutter SDK**
   ```powershell
   # Create a directory for Flutter
   New-Item -ItemType Directory -Force -Path "C:\flutter"
   
   # Download Flutter (you can also download from https://flutter.dev/docs/get-started/install/windows)
   # Download the stable release zip file and extract to C:\flutter
   ```

2. **Add Flutter to PATH**
   ```powershell
   # Add Flutter to system PATH
   $env:PATH += ";C:\flutter\bin"
   
   # To make it permanent, add to system environment variables
   [Environment]::SetEnvironmentVariable("Path", $env:PATH + ";C:\flutter\bin", "User")
   ```

### Step 2: Install Android Studio

1. **Download Android Studio**
   - Go to https://developer.android.com/studio
   - Download Android Studio for Windows
   - Install with default settings

2. **Install Android SDK**
   - Open Android Studio
   - Go to `File > Settings > Appearance & Behavior > System Settings > Android SDK`
   - Install the latest Android SDK (API 33 or 34)
   - Install Android SDK Build-Tools
   - Install Android Emulator

### Step 3: Set up Android SDK Environment Variables

```powershell
# Set ANDROID_HOME environment variable
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "User")

# Add Android SDK tools to PATH
$newPath = $env:PATH + ";$androidHome\tools;$androidHome\tools\bin;$androidHome\platform-tools"
[Environment]::SetEnvironmentVariable("Path", $newPath, "User")

# Reload environment variables
$env:ANDROID_HOME = $androidHome
$env:PATH = $newPath
```

## 🔧 Flutter Configuration

### Step 4: Verify Flutter Installation

```powershell
# Restart PowerShell and run
flutter doctor

# This will show what needs to be installed/configured
flutter doctor --android-licenses
```

### Step 5: Accept Android Licenses

```powershell
# Accept all Android SDK licenses
flutter doctor --android-licenses
# Type 'y' for all prompts
```

## 📱 Create Android Virtual Device (AVD)

### Step 6: Set up Android Emulator

1. **Open Android Studio**
2. **Go to AVD Manager**
   - `Tools > AVD Manager` or click the AVD Manager icon
3. **Create Virtual Device**
   - Click `Create Virtual Device`
   - Choose `Phone > Pixel 4` or similar
   - Download and select a system image (API 30+ recommended)
   - Configure AVD settings:
     - Name: `Agri_Monitor_Test`
     - Advanced Settings: 
       - RAM: 4GB or more
       - Internal Storage: 8GB or more
       - SD Card: 2GB
4. **Start Emulator**
   - Click the play button to start the emulator

### Alternative: Command Line AVD Creation

```powershell
# List available system images
avdmanager list targets

# Create AVD via command line
avdmanager create avd -n "Agri_Monitor_Test" -k "system-images;android-30;google_apis;x86_64" -d "pixel_4"

# Start emulator
emulator -avd Agri_Monitor_Test
```

## 🚀 Running the Mobile App

### Step 7: Navigate to Project Directory

```powershell
# Navigate to the mobile app directory
cd "C:\Users\Gayatri Gurugubelli\agri-monitoring-platform\mobile_app"
```

### Step 8: Install Dependencies

```powershell
# Get Flutter dependencies
flutter pub get

# If there are any issues, clean and get again
flutter clean
flutter pub get
```

### Step 9: Check Connected Devices

```powershell
# Check if emulator is detected
flutter devices

# You should see your emulator listed
```

### Step 10: Run the Application

```powershell
# Run the app on the emulator
flutter run

# Or run with specific device
flutter run -d emulator-5554

# For debug mode with hot reload
flutter run --debug
```

## 🔧 Troubleshooting Common Issues

### Issue 1: Flutter Not Recognized
```powershell
# Verify Flutter is in PATH
flutter --version

# If not working, restart PowerShell and check PATH
echo $env:PATH
```

### Issue 2: Android SDK Not Found
```powershell
# Check Android SDK location
flutter doctor -v

# Set ANDROID_HOME if needed
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

### Issue 3: Emulator Not Starting
```powershell
# Check available AVDs
emulator -list-avds

# Start specific AVD
emulator -avd Agri_Monitor_Test -no-snapshot-load
```

### Issue 4: Build Errors
```powershell
# Clean project
flutter clean

# Update dependencies
flutter pub get

# Rebuild
flutter run
```

### Issue 5: Permission Issues
```powershell
# Accept licenses
flutter doctor --android-licenses

# Check doctor status
flutter doctor
```

## 📱 Testing the Agri Monitor Features

Once the app is running, you can test:

### 1. **Dashboard Features**
- ✅ Overview cards with crop health, soil moisture, pest risk
- ✅ Interactive field map (expandable)
- ✅ Agricultural trends with side-by-side analysis
- ✅ Multi-language support (13 Indian languages + English)
- ✅ Text-to-speech functionality

### 2. **Crop Recommendations**
- ✅ State selector (all 36 Indian states)
- ✅ Seasonal recommendations (Kharif, Rabi, Zaid)
- ✅ Climate and market insights
- ✅ Voice reading in Hindi and English

### 3. **Disease Analysis**
- ✅ Camera integration for crop photos
- ✅ Gallery image selection
- ✅ AI-powered disease detection simulation
- ✅ Treatment recommendations

### 4. **Hyperspectral Analysis**
- ✅ Advanced spectral imaging interface
- ✅ Multi-band analysis simulation
- ✅ Crop health metrics display

### 5. **Alerts & Notifications**
- ✅ SMS notification system (demo mode)
- ✅ In-app alerts page
- ✅ Alert filtering and management
- ✅ Real-time notification badges

## 🎯 Quick Commands Summary

```powershell
# Setup (run once)
flutter doctor
flutter doctor --android-licenses

# Development workflow
cd "C:\Users\Gayatri Gurugubelli\agri-monitoring-platform\mobile_app"
flutter pub get
flutter devices
flutter run

# Debugging
flutter logs
flutter clean && flutter pub get && flutter run
```

## 📋 System Requirements

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 10GB free space
- **CPU**: Intel i5 or equivalent with virtualization support

## 🔍 Verification Checklist

Before running the app, ensure:
- [ ] Flutter SDK installed and in PATH
- [ ] Android Studio installed
- [ ] Android SDK downloaded
- [ ] Environment variables set (ANDROID_HOME)
- [ ] Android licenses accepted
- [ ] Android emulator created and running
- [ ] `flutter doctor` shows no critical issues
- [ ] Project dependencies installed (`flutter pub get`)

## 🚀 Next Steps

After successful setup:
1. **Test Basic Functionality**: Navigate through all tabs
2. **Test TTS Features**: Try Hindi and English voice reading
3. **Test Image Capture**: Use camera/gallery features
4. **Test Alerts**: Generate demo alerts
5. **Test Language Switching**: Try different Indian languages

This comprehensive setup will give you a fully functional development environment to test and demonstrate the enhanced Agri Monitor mobile application!