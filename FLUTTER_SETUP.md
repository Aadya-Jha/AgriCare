# Flutter Setup Instructions

## Prerequisites

1. **Install Flutter SDK**:
   - Download from: https://docs.flutter.dev/get-started/install/windows
   - Extract to `C:\flutter`
   - Add `C:\flutter\bin` to your PATH environment variable

2. **Install Android Studio**:
   - Download from: https://developer.android.com/studio
   - Install Android SDK and Android SDK Command-line Tools
   - Configure Android Virtual Device (AVD)

3. **Install VS Code Extensions** (optional but recommended):
   - Flutter
   - Dart
   - Android iOS Emulator

## Verify Installation

Run these commands to verify your setup:

```bash
flutter doctor
flutter doctor --android-licenses
```

## Create Flutter Project

Once Flutter is installed, run:

```bash
# From the project root directory
flutter create mobile_app --org com.agrimonitor.app
cd mobile_app
flutter pub get
```

## Run the Application

```bash
# Start an Android emulator or connect a device
flutter devices

# Run the app
flutter run
```

## Build for Production

```bash
# Android APK
flutter build apk --release

# Android App Bundle (for Google Play)
flutter build appbundle --release

# iOS (requires macOS and Xcode)
flutter build ios --release
```