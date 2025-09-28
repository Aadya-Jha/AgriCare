#!/bin/bash
set -e

echo "=== AgriCare Flutter Web Build ==="

# Install Flutter
echo "Installing Flutter SDK..."
if [ ! -d "flutter" ]; then
    git clone https://github.com/flutter/flutter.git -b stable --depth 1
fi

export PATH="$PWD/flutter/bin:$PATH"
export FLUTTER_ROOT="$PWD/flutter"

# Accept licenses
echo "Configuring Flutter..."
flutter config --no-analytics
flutter precache --web

# Navigate to mobile app directory
cd mobile_app

# Enable web support
flutter config --enable-web

# Clean and get dependencies
echo "Getting Flutter dependencies..."
flutter clean
flutter pub get

# Build for web with optimization
echo "Building Flutter web app..."
flutter build web --release --web-renderer html --dart-define=FLUTTER_WEB_USE_SKIA=false

# Create web directory in root and copy build files
cd ..
mkdir -p web
cp -r mobile_app/build/web/* web/

# Create a simple index for root access
cp web/index.html index.html

echo "✅ Flutter web build completed successfully!"
echo "📁 Files built in ./web directory"
ls -la web/
