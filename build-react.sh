#!/bin/bash
set -e

echo "=== AgriCare React Frontend Build ==="

# Navigate to frontend directory
cd frontend

# Clean up any existing build
rm -rf node_modules build

# Install Node.js dependencies with legacy peer deps to handle conflicts
npm install --legacy-peer-deps

# Build the React app for production
npm run build

# Copy build files to root
cd ..
mkdir -p web
cp -r frontend/build/* web/

# Create simple index.html redirect in root
cp web/index.html index.html

echo "✅ React build completed successfully!"
echo "📁 Files built in ./web directory"
ls -la web/