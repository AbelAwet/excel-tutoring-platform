# Mobile Connection Test Script
param(
    [Parameter(Mandatory=$true)]
    [string]$IPAddress
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " MOBILE CONNECTION TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing IP Address: $IPAddress" -ForegroundColor Yellow
Write-Host ""

# Test Backend Health
Write-Host "🔍 Testing Backend Connection..." -ForegroundColor Green
try {
    $backendUrl = "http://${IPAddress}:5000/health"
    $response = Invoke-RestMethod -Uri $backendUrl -TimeoutSec 10
    if ($response.success) {
        Write-Host "✅ Backend is accessible!" -ForegroundColor Green
        Write-Host "   URL: $backendUrl" -ForegroundColor Gray
    } else {
        Write-Host "❌ Backend responded but with error" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend is NOT accessible" -ForegroundColor Red
    Write-Host "   URL: http://${IPAddress}:5000/health" -ForegroundColor Gray
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test Frontend
Write-Host "🔍 Testing Frontend Connection..." -ForegroundColor Green
try {
    $frontendUrl = "http://${IPAddress}:5173"
    $response = Invoke-WebRequest -Uri $frontendUrl -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible!" -ForegroundColor Green
        Write-Host "   URL: $frontendUrl" -ForegroundColor Gray
    } else {
        Write-Host "❌ Frontend responded with status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Frontend is NOT accessible" -ForegroundColor Red
    Write-Host "   URL: http://${IPAddress}:5173" -ForegroundColor Gray
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Check Environment Files
Write-Host "🔍 Checking Configuration Files..." -ForegroundColor Green

# Check frontend .env
if (Test-Path "frontend\.env") {
    $frontendEnv = Get-Content "frontend\.env" | Select-String "VITE_API_URL"
    if ($frontendEnv -match $IPAddress) {
        Write-Host "✅ Frontend .env configured correctly" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend .env still uses localhost" -ForegroundColor Red
        Write-Host "   Current: $frontendEnv" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Frontend .env file not found" -ForegroundColor Red
}

# Check backend .env
if (Test-Path "backend\.env") {
    $backendEnv = Get-Content "backend\.env" | Select-String "FRONTEND_URL"
    if ($backendEnv -match $IPAddress) {
        Write-Host "✅ Backend .env configured correctly" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend .env still uses localhost" -ForegroundColor Red
        Write-Host "   Current: $backendEnv" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Backend .env file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " MOBILE TESTING INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📱 On your phone:" -ForegroundColor Yellow
Write-Host "1. Connect to the SAME WiFi network" -ForegroundColor White
Write-Host "2. Open browser and go to: http://${IPAddress}:5173" -ForegroundColor White
Write-Host "3. Try logging in or signing up" -ForegroundColor White
Write-Host ""

Write-Host "🔧 If it doesn't work:" -ForegroundColor Yellow
Write-Host "1. Check Windows Firewall (allow Node.js)" -ForegroundColor White
Write-Host "2. Restart both servers after config changes" -ForegroundColor White
Write-Host "3. Try different browser on phone" -ForegroundColor White
Write-Host "4. Verify both devices on same network" -ForegroundColor White