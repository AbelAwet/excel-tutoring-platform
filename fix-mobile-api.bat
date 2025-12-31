@echo off
echo ========================================
echo  MOBILE API FIX - LOGIN/SIGNUP ISSUE
echo ========================================
echo.

echo 🔍 STEP 1: Find Your IP Address
echo.
ipconfig | findstr "IPv4"
echo.
set /p USER_IP="Enter your computer's IP address: "

if "%USER_IP%"=="" (
    echo ❌ No IP address entered. Exiting...
    pause
    exit /b 1
)

echo.
echo ✅ Using IP address: %USER_IP%
echo.

echo 🔧 STEP 2: Fix Frontend API Configuration
echo.

REM Backup current file
copy "frontend\.env" "frontend\.env.backup" >nul 2>&1
echo ✅ Backup created: frontend\.env.backup

REM Update frontend .env with correct API URL
(
echo # API Configuration
echo VITE_API_URL=http://%USER_IP%:5000/api/v1
echo VITE_SOCKET_URL=http://%USER_IP%:5000
echo.
echo # App Configuration
echo VITE_APP_NAME=EXCEL Tutoring Service
echo VITE_APP_DESCRIPTION=Find and book qualified tutors for personalized learning
echo.
echo # Feature Flags
echo VITE_ENABLE_CHAT=true
echo VITE_ENABLE_NOTIFICATIONS=true
echo.
echo # Payment
echo VITE_TELEBIRR_ENABLED=true
echo.
echo # File Upload
echo VITE_MAX_FILE_SIZE=5242880
echo VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf
) > frontend\.env

echo ✅ Frontend .env updated with IP: %USER_IP%
echo.

echo 🚀 STEP 3: Restart Frontend Server
echo.
echo ⚠️  IMPORTANT: You MUST restart the frontend server!
echo.
echo 1️⃣  Go to your frontend terminal
echo 2️⃣  Press Ctrl+C to stop the server
echo 3️⃣  Run: npm run dev
echo 4️⃣  Wait for it to start completely
echo.

echo 📱 STEP 4: Test Login/Signup on Phone
echo.
echo 1️⃣  Refresh the webpage on your phone
echo 2️⃣  Try signing up or logging in
echo 3️⃣  It should work now!
echo.

echo ========================================
echo  🔍 VERIFICATION
echo ========================================
echo.
echo ✅ Frontend should now use: http://%USER_IP%:5000/api/v1
echo ✅ Phone can reach: http://%USER_IP%:5173 (webpage)
echo ✅ Phone can reach: http://%USER_IP%:5000 (API)
echo.

echo 🔄 If login still fails:
echo 1. Check backend terminal for errors
echo 2. Try: http://%USER_IP%:5000/health on phone
echo 3. Ensure both servers are running
echo.

echo 📋 Your URLs:
echo Frontend: http://%USER_IP%:5173
echo Backend API: http://%USER_IP%:5000/api/v1
echo Backend Health: http://%USER_IP%:5000/health
echo.

pause