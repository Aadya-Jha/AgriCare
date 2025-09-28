@echo off
echo 🌱 Starting UNIFIED Agriculture Monitoring Platform
echo =====================================================
echo 🔗 SINGLE CONSOLIDATED BACKEND - All Features Integrated
echo 📊 Dashboard + Karnataka Crops + Image Analysis + Hyperspectral + MATLAB
echo 🚀 Running on PORT 3001 ONLY - No More Port Conflicts!
echo =====================================================

echo.
echo 🛑 Stopping any existing processes on ports 3001, 5000, 3002...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3002" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo.
echo 🔧 Starting UNIFIED Backend Server (Port 3001 ONLY)...
start "Unified Agriculture Platform" cmd /k "python consolidated_server.py"

echo 🎯 Waiting for unified backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Starting Frontend Development Server (Port 3000)...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ✅ Unified Platform Started Successfully!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔗 Unified Backend API: http://localhost:3001/api
echo 🏥 Health Check: http://localhost:3001/api/health
echo 🧬 MATLAB Status: http://localhost:3001/api/matlab/status
echo 📊 Enhanced Dashboard: http://localhost:3001/api/dashboard/enhanced-summary
echo.
echo ===============================================================================
echo 🌾 ALL FEATURES UNIFIED IN SINGLE BACKEND (PORT 3001):
echo   ✅ Real-time Dashboard with enhanced hyperspectral integration
echo   ✅ Karnataka Crop Recommendations for 8 locations with weather AI
echo   ✅ Advanced Image Analysis with disease detection (8+ conditions)
echo   ✅ Hyperspectral Processing (RGB to 424-band conversion)
echo   ✅ MATLAB Integration for advanced processing
echo   ✅ Cross-Platform Support (Mobile Flutter + Web React)
echo   ✅ Offline-First Architecture with background sync
echo   ✅ Enhanced Trends with vegetation indices and stress indicators
echo.
echo Available Karnataka Locations:
echo   🏙️  Bangalore  🏛️  Mysore    🌾 Hubli      🏖️  Mangalore
echo   🏘️  Belgaum   🌍 Gulbarga   🌲 Shimoga    🍃 Hassan
echo.
echo 🌱 CROP DATABASE (10 crops):
echo   Rice, Ragi, Cotton, Sugarcane, Groundnut, Maize, 
echo   Soybean, Tomato, Onion, Coconut
echo.
echo 🔬 HYPERSPECTRAL FEATURES:
echo   • RGB to 424-band hyperspectral conversion
echo   • Crop health classification (Excellent, Good, Fair, Poor)
echo   • Vegetation indices (NDVI, SAVI, EVI, GNDVI)
echo   • Multi-location analysis across 10 Indian cities
echo   • Real-time processing and analysis
echo ===============================================================================
echo.
echo 💡 Usage Instructions:
echo   1. Open http://localhost:3000 in your browser
echo   2. Navigate to "Farm Overview" for dashboard monitoring
echo   3. Click "Karnataka Crop Recommendations" tab for crop suggestions
echo   4. Use "Image Analysis" for hyperspectral processing
echo   5. Upload images for instant crop health analysis
echo.
echo 🔗 Key API Endpoints:
echo   Dashboard:
echo   • GET  /api/dashboard/summary - Farm overview data
echo   • GET  /api/trends/1 - Agricultural trends
echo   • GET  /api/alerts - Alert notifications
echo.
echo   Karnataka Crop System:
echo   • GET  /api/karnataka/locations - Available locations
echo   • GET  /api/karnataka/comprehensive-analysis/Bangalore - Full analysis
echo   • GET  /api/crop/growth-plan/Rice - Growth planning
echo   • GET  /api/crop/database - Complete crop database
echo.
echo   Hyperspectral Analysis:
echo   • POST /api/hyperspectral/process-image - Image analysis
echo   • GET  /api/hyperspectral/predictions - All location predictions
echo   • GET  /api/hyperspectral/predict-location/Mumbai - Location-specific
echo   • GET  /api/hyperspectral/model-info - Model information
echo.
echo 🛠️  Troubleshooting:
echo   • If port 3001 error: Check if another process is using the port
echo   • If frontend issues: Ensure npm dependencies are installed (npm install)
echo   • If database errors: Delete agriculture_consolidated.db and restart
echo   • If connection issues: Check firewall settings for ports 3000 and 3001
echo.
echo ⭐ SINGLE SERVER - NO MORE PORT CONFLICTS!
echo 🚀 Everything consolidated into one powerful backend!
echo ===============================================================================

pause
