# 🚀 Quick Flutter Setup Commands

## Step-by-Step Manual Setup

### 1. Download and Install Flutter (Manual)
```powershell
# Create Flutter directory
New-Item -ItemType Directory -Force -Path "C:\flutter"

# Download Flutter from: https://docs.flutter.dev/get-started/install/windows
# Extract the downloaded flutter_windows_*.zip to C:\flutter
```

### 2. Add Flutter to PATH
```powershell
# Add Flutter to user PATH
$env:PATH += ";C:\flutter\bin"
[Environment]::SetEnvironmentVariable("Path", $env:PATH + ";C:\flutter\bin", "User")
```

### 3. Install Android Studio
- Download from: https://developer.android.com/studio
- Install with default settings
- Open Android Studio and complete the setup wizard

### 4. Set Android SDK Environment Variables
```powershell
# Set ANDROID_HOME
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "User")
$env:ANDROID_HOME = $androidHome

# Add Android tools to PATH
$androidPaths = ";$androidHome\tools;$androidHome\tools\bin;$androidHome\platform-tools;$androidHome\emulator"
[Environment]::SetEnvironmentVariable("Path", $env:PATH + $androidPaths, "User")
```

### 5. Restart PowerShell and Verify Installation
```powershell
# Restart PowerShell, then run:
flutter doctor

# Accept Android licenses
flutter doctor --android-licenses
```

### 6. Create Android Virtual Device
1. Open Android Studio
2. Go to Tools > AVD Manager
3. Click "Create Virtual Device"
4. Choose Pixel 4 or similar phone
5. Download and select Android 12 (API 31) or later
6. Name it "Agri_Monitor_Test"
7. Click "Finish" and start the emulator

### 7. Run the Mobile App
```powershell
# Navigate to project
cd "C:\Users\Gayatri Gurugubelli\agri-monitoring-platform\mobile_app"

# Get dependencies
flutter pub get

# Check devices
flutter devices

# Run the app
flutter run
```

## 🔧 Quick Verification Commands
```powershell
# Check Flutter
flutter --version

# Check devices
flutter devices

# Check Android SDK
flutter doctor -v

# Run app in debug mode
flutter run --debug
```

## ⚠️ Common Issues & Solutions

### Issue: "flutter is not recognized"
```powershell
# Restart PowerShell and check PATH
$env:PATH -split ";" | Select-String "flutter"
```

### Issue: "Android SDK not found"
```powershell
# Check ANDROID_HOME
echo $env:ANDROID_HOME

# Set if missing
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

### Issue: "No connected devices"
```powershell
# Start emulator from command line
emulator -list-avds
emulator -avd Agri_Monitor_Test
```

### Issue: Build errors
```powershell
# Clean and rebuild
flutter clean
flutter pub get
flutter run
```

## 📱 Testing the App Features

Once running, test these features:

1. **Dashboard Tab**: Overview cards, interactive map, trends
2. **Crops Tab**: State selector, seasonal recommendations
3. **Disease Tab**: Camera/gallery image analysis
4. **Hyperspectral Tab**: Advanced imaging interface
5. **Language Selector**: Try Hindi and other Indian languages
6. **TTS Features**: Voice reading in Hindi/English
7. **Alerts**: Notification bell icon with badge
8. **Demo Alerts**: Generate sample alerts

## 🎯 Expected Results

✅ Dashboard loads with overview cards  
✅ Map is interactive and expandable  
✅ Language switching works  
✅ Voice reading works in Hindi/English  
✅ All tabs are accessible  
✅ Camera integration works  
✅ Alerts system functions  
✅ State selection shows all Indian states  

The complete setup will give you a fully functional agricultural monitoring app!