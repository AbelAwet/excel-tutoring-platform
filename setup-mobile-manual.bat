@echo off
echo ========================================
echo  MANUAL MOBILE SETUP - STEP BY STEP
echo ========================================
echo.

echo 🔍 STEP 1: Find Your IP Address
echo.
echo Running ipconfig to find your IP...
ipconfig | findstr "IPv4"
echo.
echo ⚠️  IMPORTANT: Look for your WiFi adapter's IPv4 Address above
echo    It should look like: 192.168.1.XXX or 10.0.0.XXX
echo.
set /p USER_IP="Enter your IP address (e.g., 192.168.1.100): "

if "%USER_IP%"=="" (
    echo ❌ No IP address entered. Exiting...
    pause
    exit /b 1
)

echo.
echo ✅ Using IP address: %USER_IP%
echo.

echo 🔧 STEP 2: Updating Configuration Files
echo.

REM Backup original files
if not exist "config-backup" mkdir config-backup
copy "frontend\.env" "config-backup\frontend.env.backup" >nul 2>&1
copy "backend\.env" "config-backup\backend.env.backup" >nul 2>&1
echo ✅ Backup created

REM Update frontend .env
echo Updating frontend/.env...
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

REM Update backend .env
echo Updating backend/.env...
powershell -Command "(Get-Content 'backend\.env') -replace 'FRONTEND_URL=http://localhost:5173', 'FRONTEND_URL=http://%USER_IP%:5173' | Set-Content 'backend\.env'"

echo ✅ Configuration files updated
echo.

echo 🚀 STEP 3: Server Restart Instructions
echo.
echo ⚠️  IMPORTANT: You MUST restart both servers now!
echo.
echo 1️⃣  Close any running terminals with Ctrl+C
echo.
echo 2️⃣  Start Backend (Terminal 1):
echo    cd backend
echo    npm run dev
echo.
echo 3️⃣  Start Frontend (Terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo 4️⃣  Allow Firewall Access:
echo    When Windows asks about Node.js:
echo    ✅ Check "Private networks"
echo    ✅ Check "Public networks" 
echo    ✅ Click "Allow access"
echo.

echo 📱 STEP 4: Mobile Testing
echo.
echo 1️⃣  Connect phone to SAME WiFi network
echo.
echo 2️⃣  Test Backend Connection:
echo    Open phone browser: http://%USER_IP%:5000/health
echo    Should show: {"success": true, "message": "Server is running"}
echo.
echo 3️⃣  Test Frontend:
echo    Open phone browser: http://%USER_IP%:5173
echo    Should load: EXCEL Tutoring Service homepage
echo.
echo 4️⃣  Test Login/Signup:
echo    Try creating account or logging in
echo.

echo ========================================
echo  🔧 TROUBLESHOOTING
echo ========================================
echo.
echo ❌ Can't connect to backend?
echo    • Check firewall settings
echo    • Ensure backend server is running
echo    • Try: http://%USER_IP%:5000/health
echo.
echo ❌ Can't load frontend?
echo    • Check frontend server is running
echo    • Ensure Vite shows "Network" URL
echo    • Try different browser on phone
echo.
echo ❌ Login fails?
echo    • Backend must be accessible first
echo    • Check browser console for errors
echo    • Verify both servers restarted after config change
echo.
echo 🔄 To restore original settings:
echo    copy config-backup\frontend.env.backup frontend\.env
echo    copy config-backup\backend.env.backup backend\.env
echo.

echo ========================================
echo  📋 QUICK REFERENCE
echo ========================================
echo.
echo Your IP: %USER_IP%
echo Backend Health: http://%USER_IP%:5000/health
echo Frontend URL: http://%USER_IP%:5173
echo.
echo Backend Command: cd backend ^&^& npm run dev
echo Frontend Command: cd frontend ^&^& npm run dev
echo.

pause