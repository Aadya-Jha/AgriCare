@echo off
echo ===============================================================================
echo 🌾 Agriculture Monitoring Platform - Testing Script
echo ===============================================================================
echo.

echo 📋 TESTING CHECKLIST:
echo ===============================================================================
echo 1. ✅ Frontend is running at: http://localhost:3000
echo 2. 🔄 Starting backend server on port 5000...
echo.

echo Starting Flask backend server...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && python app.py"

echo.
echo ⏱️  Waiting 10 seconds for backend to initialize...
timeout /t 10 /nobreak

echo.
echo ===============================================================================
echo 🧪 MANUAL TESTING INSTRUCTIONS:
echo ===============================================================================
echo.
echo 🌐 FRONTEND TESTING (http://localhost:3000):
echo   ✅ 1. Open your browser and go to http://localhost:3000
echo   ✅ 2. Check if the main dashboard loads without errors
echo   ✅ 3. Navigate between different tabs (Dashboard, Karnataka Crops, etc.)
echo   ✅ 4. Look for any console errors in browser dev tools (F12)
echo.
echo 🔗 BACKEND API TESTING (http://localhost:5000):
echo   Test these endpoints in your browser or Postman:
echo.
echo   📊 DASHBOARD ENDPOINTS:
echo   • http://localhost:5000/api/dashboard/summary
echo   • http://localhost:5000/api/trends/1  
echo   • http://localhost:5000/api/alerts
echo.
echo   🌾 KARNATAKA CROP ENDPOINTS:
echo   • http://localhost:5000/api/karnataka/locations
echo   • http://localhost:5000/api/karnataka/comprehensive-analysis/Bangalore
echo   • http://localhost:5000/api/crop/database
echo.
echo   🖼️ IMAGE ANALYSIS ENDPOINTS:
echo   • http://localhost:5000/api/hyperspectral/predictions
echo   • http://localhost:5000/api/hyperspectral/model-info
echo.
echo   ⚡ HEALTH CHECK:
echo   • http://localhost:5000/api/health (should return server status)
echo.
echo ===============================================================================
echo 🔧 TROUBLESHOOTING:
echo ===============================================================================
echo.
echo ❌ If Frontend doesn't load:
echo   • Check if port 3000 is free
echo   • Run: cd frontend && npm install && npm start
echo.
echo ❌ If Backend API calls fail:
echo   • Check if port 5000 is free  
echo   • Look for Python/Flask errors in the backend terminal
echo   • Verify all Python dependencies are installed
echo.
echo ❌ If Database errors:
echo   • Check if agriculture_enhanced.db exists in backend folder
echo   • Look for SQLite-related error messages
echo.
echo ❌ If MATLAB errors (can be ignored for basic testing):
echo   • MATLAB integration may not work without proper license
echo   • Core functionality should work without MATLAB
echo.
echo ===============================================================================
echo 🎯 QUICK API TESTS:
echo ===============================================================================

echo Testing backend health endpoint...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ Backend Health: PASS' -ForegroundColor Green; Write-Host $response.Content } catch { Write-Host '❌ Backend Health: FAIL - Server not responding' -ForegroundColor Red }"

echo.
echo Testing dashboard summary endpoint...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/dashboard/summary' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ Dashboard API: PASS' -ForegroundColor Green } catch { Write-Host '❌ Dashboard API: FAIL' -ForegroundColor Red; Write-Host $_.Exception.Message }"

echo.
echo Testing Karnataka locations endpoint...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/karnataka/locations' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ Karnataka API: PASS' -ForegroundColor Green } catch { Write-Host '❌ Karnataka API: FAIL' -ForegroundColor Red }"

echo.
echo ===============================================================================
echo 🚀 TESTING COMPLETE!
echo ===============================================================================
echo.
echo 📱 Next Steps:
echo   1. Open http://localhost:3000 in your browser
echo   2. Test the web application functionality
echo   3. Monitor both terminal windows for errors
echo   4. Use browser developer tools to check for JavaScript errors
echo.
echo Press any key to continue...
pause