# Agriculture Platform Quick Test Script
Write-Host "🌾 Agriculture Monitoring Platform - Quick Test" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Test if frontend is running
Write-Host "🔍 Testing Frontend (Port 3000)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ Frontend: RUNNING" -ForegroundColor Green
    Write-Host "   📱 Open: http://localhost:3000" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Frontend: NOT RUNNING" -ForegroundColor Red
    Write-Host "   💡 Run: cd frontend && npm start" -ForegroundColor Yellow
}

Write-Host ""

# Test if backend is running
Write-Host "🔍 Testing Backend (Port 5000)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ Backend: RUNNING" -ForegroundColor Green
    Write-Host "   🔗 API Base: http://localhost:5000/api" -ForegroundColor Cyan
    
    # Test key endpoints
    Write-Host ""
    Write-Host "🧪 Testing Key API Endpoints:" -ForegroundColor Yellow
    
    # Dashboard
    try {
        $dashResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/dashboard/summary" -UseBasicParsing -TimeoutSec 3
        Write-Host "   ✅ Dashboard API: WORKING" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️ Dashboard API: ERROR" -ForegroundColor Yellow
    }
    
    # Karnataka locations
    try {
        $karnatakaResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/karnataka/locations" -UseBasicParsing -TimeoutSec 3
        Write-Host "   ✅ Karnataka API: WORKING" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️ Karnataka API: ERROR" -ForegroundColor Yellow
    }
    
    # Hyperspectral
    try {
        $hyperResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/hyperspectral/predictions" -UseBasicParsing -TimeoutSec 3
        Write-Host "   ✅ Hyperspectral API: WORKING" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️ Hyperspectral API: ERROR" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Backend: NOT RUNNING" -ForegroundColor Red
    Write-Host "   💡 Run: cd backend && python app.py" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "🎯 QUICK TEST RESULTS:" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Manual Testing Checklist:" -ForegroundColor Cyan
Write-Host "  1. Open http://localhost:3000 in browser" -ForegroundColor White
Write-Host "  2. Check dashboard loads properly" -ForegroundColor White
Write-Host "  3. Test navigation between tabs" -ForegroundColor White
Write-Host "  4. Try Karnataka crop recommendations" -ForegroundColor White
Write-Host "  5. Test image upload/analysis features" -ForegroundColor White
Write-Host ""
Write-Host "🔧 If issues found:" -ForegroundColor Cyan
Write-Host "  • Check browser console (F12) for errors" -ForegroundColor White
Write-Host "  • Monitor terminal windows for error messages" -ForegroundColor White
Write-Host "  • Verify all dependencies are installed" -ForegroundColor White
Write-Host ""
Write-Host "===============================================" -ForegroundColor Green