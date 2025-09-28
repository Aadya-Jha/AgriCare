# Flutter Android Setup Script for Agri Monitor Mobile App
# Run as Administrator for best results

Write-Host "🚀 Starting Flutter & Android SDK Setup..." -ForegroundColor Green

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check admin rights
if (-not (Test-Administrator)) {
    Write-Warning "⚠️  This script should be run as Administrator for better results."
    Write-Host "Right-click PowerShell and select 'Run as Administrator'"
}

# Create directories
Write-Host "📁 Creating directories..." -ForegroundColor Yellow
$flutterDir = "C:\flutter"
$toolsDir = "C:\dev-tools"

if (-not (Test-Path $flutterDir)) {
    New-Item -ItemType Directory -Force -Path $flutterDir | Out-Null
    Write-Host "✅ Created Flutter directory: $flutterDir" -ForegroundColor Green
}

if (-not (Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
    Write-Host "✅ Created tools directory: $toolsDir" -ForegroundColor Green
}

# Check if Chocolatey is installed
Write-Host "🍫 Checking Chocolatey..." -ForegroundColor Yellow
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "📥 Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    try {
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        Write-Host "✅ Chocolatey installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install Chocolatey: $_" -ForegroundColor Red
        Write-Host "Please install manually from https://chocolatey.org/install" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Chocolatey is already installed" -ForegroundColor Green
}

# Install Git if not present
Write-Host "📦 Checking Git..." -ForegroundColor Yellow
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "📥 Installing Git..." -ForegroundColor Yellow
    try {
        choco install git -y
        Write-Host "✅ Git installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install Git" -ForegroundColor Red
    }
} else {
    Write-Host "✅ Git is already installed" -ForegroundColor Green
}

# Download Flutter
Write-Host "📦 Setting up Flutter SDK..." -ForegroundColor Yellow
$flutterBin = "$flutterDir\bin\flutter.bat"

if (-not (Test-Path $flutterBin)) {
    Write-Host "📥 Downloading Flutter SDK..." -ForegroundColor Yellow
    $flutterZip = "$toolsDir\flutter_windows.zip"
    $flutterUrl = "https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.16.5-stable.zip"
    
    try {
        # Download Flutter
        Write-Host "⬇️  Downloading Flutter (this may take a few minutes)..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $flutterUrl -OutFile $flutterZip
        
        # Extract Flutter
        Write-Host "📂 Extracting Flutter..." -ForegroundColor Yellow
        Expand-Archive -Path $flutterZip -DestinationPath "C:\" -Force
        
        # Clean up
        Remove-Item $flutterZip -Force
        Write-Host "✅ Flutter SDK extracted successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to download Flutter: $_" -ForegroundColor Red
        Write-Host "Please download manually from https://flutter.dev/docs/get-started/install/windows" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ Flutter SDK already exists" -ForegroundColor Green
}

# Update PATH for Flutter
Write-Host "🔧 Updating PATH for Flutter..." -ForegroundColor Yellow
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$flutterBinPath = "$flutterDir\bin"

if ($currentPath -notlike "*$flutterBinPath*") {
    $newPath = "$currentPath;$flutterBinPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    $env:PATH = "$env:PATH;$flutterBinPath"
    Write-Host "✅ Flutter added to PATH" -ForegroundColor Green
} else {
    Write-Host "✅ Flutter already in PATH" -ForegroundColor Green
}

# Set up Android SDK paths
Write-Host "🔧 Setting up Android SDK paths..." -ForegroundColor Yellow
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"
$currentAndroidHome = [Environment]::GetEnvironmentVariable("ANDROID_HOME", "User")

if ($currentAndroidHome -ne $androidHome) {
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "User")
    $env:ANDROID_HOME = $androidHome
    Write-Host "✅ ANDROID_HOME set to: $androidHome" -ForegroundColor Green
}

# Add Android tools to PATH
$androidToolsPaths = @(
    "$androidHome\tools",
    "$androidHome\tools\bin", 
    "$androidHome\platform-tools",
    "$androidHome\emulator"
)

$pathUpdated = $false
foreach ($toolPath in $androidToolsPaths) {
    if ($currentPath -notlike "*$toolPath*") {
        $currentPath = "$currentPath;$toolPath"
        $pathUpdated = $true
    }
}

if ($pathUpdated) {
    [Environment]::SetEnvironmentVariable("Path", $currentPath, "User")
    Write-Host "✅ Android SDK tools added to PATH" -ForegroundColor Green
}

# Refresh environment variables
Write-Host "🔄 Refreshing environment..." -ForegroundColor Yellow
$env:PATH = [Environment]::GetEnvironmentVariable("Path", "User") + ";" + [Environment]::GetEnvironmentVariable("Path", "Machine")

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. ⚠️  RESTART PowerShell to reload environment variables" -ForegroundColor Yellow
Write-Host "2. 📱 Install Android Studio from: https://developer.android.com/studio" -ForegroundColor Yellow
Write-Host "3. 🔧 Run: flutter doctor" -ForegroundColor Yellow
Write-Host "4. 📜 Run: flutter doctor --android-licenses" -ForegroundColor Yellow
Write-Host "5. 📱 Create Android Virtual Device (AVD) in Android Studio" -ForegroundColor Yellow
Write-Host "6. 🚀 Navigate to mobile_app folder and run: flutter run" -ForegroundColor Yellow

Write-Host "`n📋 Manual Steps Required:" -ForegroundColor Cyan
Write-Host "• Install Android Studio manually" -ForegroundColor White
Write-Host "• Install Android SDK (API 30+) via Android Studio" -ForegroundColor White
Write-Host "• Create and start an Android emulator" -ForegroundColor White
Write-Host "• Accept Android licenses with: flutter doctor --android-licenses" -ForegroundColor White

Write-Host "`n✅ Basic Flutter setup completed!" -ForegroundColor Green
Write-Host "📖 See ANDROID_SETUP_GUIDE.md for detailed instructions" -ForegroundColor Yellow

# Test Flutter installation
Write-Host "`n🧪 Testing Flutter installation..." -ForegroundColor Yellow
try {
    $flutterVersion = & "$flutterDir\bin\flutter.bat" --version 2>&1
    Write-Host "✅ Flutter is working! Version info:" -ForegroundColor Green
    Write-Host $flutterVersion -ForegroundColor White
} catch {
    Write-Host "❌ Flutter test failed. Please restart PowerShell and try again." -ForegroundColor Red
}

Write-Host "`n🎉 Setup script completed!" -ForegroundColor Green
Write-Host "Please restart PowerShell and continue with Android Studio installation." -ForegroundColor Yellow