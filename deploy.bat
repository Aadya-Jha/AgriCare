@echo off
echo 🚀 Agriculture Monitoring Platform - Cross-Platform Deployment
echo ================================================================

set "PROJECT_ROOT=%CD%"
set "BUILD_DIR=%PROJECT_ROOT%\builds"
set "DATE_TIME=%date:~6,4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%"

echo.
echo 📍 Project Directory: %PROJECT_ROOT%
echo 📅 Build Date: %DATE_TIME%
echo.

REM Create builds directory
if not exist "%BUILD_DIR%" (
    mkdir "%BUILD_DIR%"
    echo ✅ Created builds directory
)

echo.
echo 🔄 Available deployment options:
echo ================================
echo 1. Deploy Backend Only
echo 2. Deploy Web App Only  
echo 3. Build Mobile App (Android)
echo 4. Build Mobile App (iOS - requires macOS)
echo 5. Deploy Full Stack (Backend + Web)
echo 6. Build Everything (Backend + Web + Mobile)
echo 7. Start Development Servers
echo 8. Run Tests
echo 9. Exit
echo.

set /p choice="👉 Enter your choice (1-9): "

if "%choice%"=="1" goto deploy_backend
if "%choice%"=="2" goto deploy_web
if "%choice%"=="3" goto build_mobile_android
if "%choice%"=="4" goto build_mobile_ios
if "%choice%"=="5" goto deploy_fullstack
if "%choice%"=="6" goto build_everything
if "%choice%"=="7" goto start_dev
if "%choice%"=="8" goto run_tests
if "%choice%"=="9" goto exit
goto invalid_choice

:deploy_backend
echo.
echo 🐍 Deploying Backend (Python Flask)...
echo ======================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    goto end
)

REM Install backend dependencies
echo 📦 Installing Python dependencies...
cd /d "%PROJECT_ROOT%\backend"
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install Python dependencies
    goto end
)

REM Create production environment file
if not exist ".env" (
    echo 🔧 Creating production environment file...
    copy ".env.example" ".env"
    echo ⚠️  Please update .env file with production values before running!
)

REM Start backend server
echo 🚀 Starting backend server...
echo Backend will be available at: http://localhost:3001
python "%PROJECT_ROOT%\consolidated_server.py"

goto end

:deploy_web
echo.
echo 🌐 Building and Deploying Web Application...
echo =============================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    goto end
)

REM Build enhanced web app
cd /d "%PROJECT_ROOT%\web_app_enhanced"

REM Check if package.json exists
if not exist "package.json" (
    echo ⚠️  Enhanced web app not found, using original frontend...
    cd /d "%PROJECT_ROOT%\frontend"
)

echo 📦 Installing Node.js dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install Node.js dependencies
    goto end
)

echo 🏗️  Building production web application...
call npm run build
if errorlevel 1 (
    echo ❌ Failed to build web application
    goto end
)

echo 📁 Copying build to deployment directory...
if exist "%BUILD_DIR%\web" rmdir /s /q "%BUILD_DIR%\web"
xcopy /e /i "build" "%BUILD_DIR%\web"

echo ✅ Web application built successfully!
echo 📍 Build location: %BUILD_DIR%\web
echo 💡 Deploy the 'web' folder contents to your web server

goto end

:build_mobile_android
echo.
echo 📱 Building Mobile App (Android)...
echo ===================================

REM Check if Flutter is installed
flutter --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Flutter is not installed or not in PATH
    echo 💡 Please install Flutter first: https://docs.flutter.dev/get-started/install
    goto end
)

cd /d "%PROJECT_ROOT%\mobile_app"

REM Check if Flutter project exists
if not exist "pubspec.yaml" (
    echo ❌ Flutter project not found in mobile_app directory
    echo 💡 Please run Flutter setup first
    goto end
)

echo 📦 Getting Flutter dependencies...
call flutter pub get
if errorlevel 1 (
    echo ❌ Failed to get Flutter dependencies
    goto end
)

echo 🔧 Running code generation...
call flutter packages pub run build_runner build --delete-conflicting-outputs

echo 🏗️  Building Android APK...
call flutter build apk --release
if errorlevel 1 (
    echo ❌ Failed to build Android APK
    goto end
)

echo 📁 Copying APK to deployment directory...
if not exist "%BUILD_DIR%\mobile\android" mkdir "%BUILD_DIR%\mobile\android"
copy "build\app\outputs\flutter-apk\app-release.apk" "%BUILD_DIR%\mobile\android\agri-monitor-v%DATE_TIME%.apk"

echo ✅ Android APK built successfully!
echo 📍 APK location: %BUILD_DIR%\mobile\android\agri-monitor-v%DATE_TIME%.apk

goto end

:build_mobile_ios
echo.
echo 📱 Building Mobile App (iOS)...
echo ===============================

echo ⚠️  iOS builds require macOS and Xcode
echo 💡 Run the following commands on macOS:
echo.
echo   cd mobile_app
echo   flutter pub get
echo   flutter build ios --release
echo   open ios/Runner.xcworkspace
echo.
echo Then archive and distribute through Xcode.

goto end

:deploy_fullstack
echo.
echo 🚀 Deploying Full Stack (Backend + Web)...
echo ===========================================

REM Deploy backend first
call :deploy_backend_silent

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Deploy web app
call :deploy_web_silent

echo.
echo ✅ Full stack deployment completed!
echo 🔗 Backend: http://localhost:3001
echo 🌐 Frontend: Served from build directory

goto end

:build_everything
echo.
echo 🌟 Building Everything (Backend + Web + Mobile)...
echo ===================================================

echo 📦 Step 1: Preparing backend...
call :deploy_backend_silent

echo 🌐 Step 2: Building web application...
call :deploy_web_silent

echo 📱 Step 3: Building mobile application...
call :build_mobile_android_silent

echo.
echo ✅ All components built successfully!
echo 📂 Check the builds directory for deployable artifacts

goto end

:start_dev
echo.
echo 🔧 Starting Development Servers...
echo ==================================

echo 🐍 Starting backend server...
start "Agriculture Backend" cmd /k "cd /d %PROJECT_ROOT% && python consolidated_server.py"

timeout /t 3 /nobreak >nul

echo 🌐 Starting web development server...
if exist "%PROJECT_ROOT%\web_app_enhanced\package.json" (
    start "Agriculture Web" cmd /k "cd /d %PROJECT_ROOT%\web_app_enhanced && npm start"
) else (
    start "Agriculture Web" cmd /k "cd /d %PROJECT_ROOT%\frontend && npm start"
)

echo.
echo ✅ Development servers started!
echo 🔗 Backend: http://localhost:3001
echo 🌐 Frontend: http://localhost:3000
echo.
echo Press any key to continue...
pause >nul

goto end

:run_tests
echo.
echo 🧪 Running Tests...
echo ===================

echo 🐍 Running Python tests...
cd /d "%PROJECT_ROOT%"
if exist "test_*.py" (
    python -m pytest test_*.py -v
) else (
    echo ⚠️  No Python tests found
)

echo.
echo 🌐 Running Web tests...
if exist "%PROJECT_ROOT%\web_app_enhanced\package.json" (
    cd /d "%PROJECT_ROOT%\web_app_enhanced"
    call npm test -- --coverage --watchAll=false
) else if exist "%PROJECT_ROOT%\frontend\package.json" (
    cd /d "%PROJECT_ROOT%\frontend"
    call npm test -- --coverage --watchAll=false
) else (
    echo ⚠️  No web tests found
)

echo.
echo 📱 Running Mobile tests...
if exist "%PROJECT_ROOT%\mobile_app\pubspec.yaml" (
    cd /d "%PROJECT_ROOT%\mobile_app"
    call flutter test
) else (
    echo ⚠️  No mobile tests found
)

goto end

:deploy_backend_silent
cd /d "%PROJECT_ROOT%\backend"
pip install -r requirements.txt >nul 2>&1
if not exist ".env" copy ".env.example" ".env" >nul 2>&1
echo ✅ Backend prepared
goto :eof

:deploy_web_silent
if exist "%PROJECT_ROOT%\web_app_enhanced\package.json" (
    cd /d "%PROJECT_ROOT%\web_app_enhanced"
) else (
    cd /d "%PROJECT_ROOT%\frontend"
)
call npm install >nul 2>&1
call npm run build >nul 2>&1
if exist "%BUILD_DIR%\web" rmdir /s /q "%BUILD_DIR%\web"
xcopy /e /i "build" "%BUILD_DIR%\web" >nul 2>&1
echo ✅ Web application built
goto :eof

:build_mobile_android_silent
cd /d "%PROJECT_ROOT%\mobile_app"
if exist "pubspec.yaml" (
    call flutter pub get >nul 2>&1
    call flutter build apk --release >nul 2>&1
    if not exist "%BUILD_DIR%\mobile\android" mkdir "%BUILD_DIR%\mobile\android"
    copy "build\app\outputs\flutter-apk\app-release.apk" "%BUILD_DIR%\mobile\android\agri-monitor.apk" >nul 2>&1
    echo ✅ Android APK built
) else (
    echo ⚠️  Flutter project not found
)
goto :eof

:invalid_choice
echo ❌ Invalid choice. Please select 1-9.
timeout /t 2 /nobreak >nul
goto start

:end
echo.
echo 🏁 Deployment script completed.
echo 📁 Build artifacts location: %BUILD_DIR%
echo.
echo 💡 Next steps:
echo   - Backend: Deploy to your server (Linux/Windows)  
echo   - Web: Upload web folder to web hosting
echo   - Mobile: Distribute APK or publish to Play Store
echo.

:exit
pause