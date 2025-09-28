@echo off
echo 🌱 Starting UNIFIED Agriculture Monitoring Platform
echo =======================================================
echo 🔬 Hyperspectral Analysis + Karnataka Crop Recommendations
echo 📊 Dashboard + Image Analysis - ALL IN ONE SERVER
echo =======================================================

echo.
echo 🛑 Stopping any existing Python processes on ports 3001 and 3002...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3002" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo.
echo 🔧 Starting Original Backend Server (Port 3001)...
start "Original Backend" cmd /k "python run_server.py"

echo 🔧 Starting Unified Backend Server (Port 3002)...
start "Unified Agriculture Platform" cmd /k "python unified_server.py"

echo 🎯 Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Starting Frontend Development Server (Port 3000)...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ✅ Unified Platform Started Successfully!
echo.
echo 🚀 Frontend: http://localhost:3000
echo 📊 Original Backend API: http://localhost:3001
echo 🌱 UNIFIED Backend API: http://localhost:3002
echo 🧭 Original Health Check: http://localhost:3001/api/health
echo 🌾 Unified Health Check: http://localhost:3002/api/health
echo.
echo ===============================================================================
echo 🌾 KARNATAKA CROP RECOMMENDATIONS:
echo   • Weather-based crop suggestions for 8 locations
echo   • AI-powered suitability scoring
echo   • Detailed growth plans with stage-wise activities
echo   • Investment analysis and yield predictions
echo   • Seasonal farming advice
echo.
echo Available Karnataka Locations:
echo   🏙️  Bangalore  🏛️  Mysore    🌾 Hubli      🏖️  Mangalore
echo   🏘️  Belgaum   🌍 Gulbarga   🌲 Shimoga    🍃 Hassan
echo.
echo 🔬 HYPERSPECTRAL IMAGE ANALYSIS:
echo   • RGB to 424-band hyperspectral conversion
echo   • Crop health classification
echo   • Vegetation indices (NDVI, SAVI, EVI, GNDVI)
echo   • Real-time processing and analysis
echo.
echo 📊 DASHBOARD FEATURES:
echo   • Real-time sensor data monitoring
echo   • Crop health predictions
echo   • Pest risk assessment
echo   • Irrigation recommendations
echo   • Agricultural trends analysis
echo.
echo 🌱 CROP DATABASE (10 crops):
echo   Rice, Ragi, Cotton, Sugarcane, Groundnut, Maize, 
echo   Soybean, Tomato, Onion, Coconut
echo ===============================================================================
echo.
echo 💡 Usage Instructions:
echo   1. Open http://localhost:3000 in your browser
echo   2. Navigate to Dashboard for farm overview
echo   3. Click "Karnataka Crop Recommendations" tab for crop suggestions
echo   4. Use "Image Analysis" for hyperspectral processing
echo   5. Upload images for instant crop health analysis
echo.
echo 🔗 API Endpoints Available:
echo   UNIFIED SERVER (Port 3002):
echo   • http://localhost:3002/api/dashboard/summary - Dashboard data
echo   • http://localhost:3002/api/karnataka/comprehensive-analysis/Bangalore - Crop recommendations
echo   • http://localhost:3002/api/crop/growth-plan/Rice - Growth planning
echo   • http://localhost:3002/api/hyperspectral/process-image - Image analysis
echo   ORIGINAL SERVER (Port 3001):
echo   • http://localhost:3001/api/hyperspectral/health - Original hyperspectral service
echo.
echo 🛠️  Troubleshooting:
echo   • If port 3001 error: Check if another process is using the port
echo   • If frontend issues: Ensure npm dependencies are installed
echo   • If database errors: Delete agriculture.db and restart
echo.
echo ⭐ All features are now integrated into one unified server!
echo 🚀 Happy farming with AI-powered agriculture monitoring!
echo ===============================================================================

pause
