@echo off
echo 🌱 Starting Agriculture Monitoring Platform with Karnataka Crop Recommendations
echo ============================================================================

echo.
echo 🔧 Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "python standalone_server.py"

echo 🎯 Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Starting Frontend Development Server (Port 3000)...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ✅ Servers are starting...
echo.
echo 🚀 Access the application at: http://localhost:3000
echo 📊 Backend API at: http://localhost:3001
echo 🌾 Karnataka Crop Recommendations: http://localhost:3000 (Dashboard > Karnataka Crop Recommendations tab)
echo.
echo Available Karnataka Locations:
echo   • Bangalore • Mysore • Hubli • Mangalore
echo   • Belgaum • Gulbarga • Shimoga • Hassan
echo.
echo ===============================================================================
echo Features Available:
echo   ✓ Real-time weather data for Karnataka locations
echo   ✓ AI-powered crop recommendations based on weather & soil
echo   ✓ Detailed growth plans with stage-wise activities  
echo   ✓ Investment analysis and expected yields
echo   ✓ Seasonal farming advice
echo   ✓ 10 crops in database: Rice, Ragi, Cotton, Sugarcane, Groundnut, 
echo     Maize, Soybean, Tomato, Onion, Coconut
echo ===============================================================================

pause
