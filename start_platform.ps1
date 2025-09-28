# AgriCare Platform Startup Script
Write-Host "🌱 Starting AgriCare Agriculture Monitoring Platform..." -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path "consolidated_server.py")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "Expected files: consolidated_server.py, frontend/" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Pre-flight checks..." -ForegroundColor Cyan

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python." -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js." -ForegroundColor Red
    exit 1
}

# Check frontend dependencies
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
    Set-Location ..
}

Write-Host "🚀 Starting servers..." -ForegroundColor Green

# Start backend server in background
Write-Host "📡 Starting backend server (port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; python consolidated_server.py; Read-Host 'Press Enter to close'"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "🎨 Starting frontend server (port 3000)..." -ForegroundColor Cyan
Set-Location frontend
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm start; Read-Host 'Press Enter to close'"

Write-Host ""
Write-Host "🎉 Platform starting up!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3001/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login credentials: admin / admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌟 Features available:" -ForegroundColor Green
Write-Host "  • Disease Analysis (Real AI Models)" -ForegroundColor White
Write-Host "  • Hyperspectral Analysis" -ForegroundColor White
Write-Host "  • Karnataka Crop Recommendations" -ForegroundColor White
Write-Host "  • Real-time Dashboard" -ForegroundColor White
Write-Host "  • Alerts & Reports" -ForegroundColor White

Read-Host "Press Enter to close this window"
