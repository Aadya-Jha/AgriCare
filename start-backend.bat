@echo off
echo ===============================================================================
echo 🚀 Starting Agriculture Monitoring Backend Server
echo ===============================================================================
echo.

echo 📍 Current Directory: %CD%
echo 🐍 Starting Python Flask Server on Port 5000...
echo.

cd /d "%~dp0backend"
echo Backend Directory: %CD%

echo.
echo 🔄 Starting server...
echo ⚠️  Keep this window open while using the application
echo 🌐 Backend will be available at: http://localhost:5000
echo 🔗 API endpoints at: http://localhost:5000/api
echo.
echo ===============================================================================

python app.py

pause