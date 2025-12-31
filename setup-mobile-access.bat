@echo off
echo ========================================
echo  EXCEL Tutoring Service Mobile Setup
echo ========================================
echo.

REM Get IP address
echo 🔍 Finding your computer's IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set "ip=%%a"
    goto :found
)

:found
REM Remove leading spaces
for /f "tokens=* delims= " %%a in ("%ip%") do set ip=%%a

echo ✅ Your IP address: %ip%
echo.

REM Backup original files
echo 📋 Creating backup of original configuration...
if not exist "config-backup" mkdir config-backup
copy "frontend\.env" "config-backup\frontend.env.backup" >nul 2>&1
copy "backend\.env" "config-backup\backend.env.backup" >nul 2>&1

REM Update frontend .env
echo 🔧 Updating frontend configuration...
powershell -Command "(Get-Content 'frontend\.env') -replace 'VITE_API_URL=http://localhost:5000/api/v1', 'VITE_API_URL=http://%ip%:5000/api/v1' | Set-Content 'frontend\.env'"
powershell -Command "(Get-Content 'frontend\.env') -replace 'VITE_SOCKET_URL=http://localhost:5000', 'VITE_SOCKET_URL=http://%ip%:5000' | Set-Content 'frontend\.env'"

REM Update backend .env
echo 🔧 Updating backend configuration...
powershell -Command "(Get-Content 'backend\.env') -replace 'FRONTEND_URL=http://localhost:5173', 'FRONTEND_URL=http://%ip%:5173' | Set-Content 'backend\.env'"

echo.
echo ✅ Configuration updated successfully!
echo.
echo ========================================
echo  📱 MOBILE ACCESS INSTRUCTIONS
echo ========================================
echo.
echo 1️⃣  RESTART SERVERS:
echo    Close any running terminals and restart both servers:
echo.
echo    Terminal 1 (Backend):
echo    cd backend
echo    npm run dev
echo.
echo    Terminal 2 (Frontend):
echo    cd frontend  
echo    npm run dev
echo.
echo 2️⃣  FIREWALL SETUP:
echo    When Windows asks about Node.js firewall access:
echo    ✅ Check "Private networks" 
echo    ✅ Check "Public networks"
echo    ✅ Click "Allow access"
echo.
echo 3️⃣  MOBILE CONNECTION:
echo    📱 Connect your phone to the SAME WiFi network
echo    🌐 Open browser on phone and go to:
echo    
echo       http://%ip%:5173
echo.
echo 4️⃣  TESTING:
echo    Test backend: http://%ip%:5000/health
echo    Test frontend: http://%ip%:5173
echo.
echo ========================================
echo  🔧 TROUBLESHOOTING
echo ========================================
echo.
echo ❌ Can't connect? Try:
echo    • Check both devices on same WiFi
echo    • Restart your router
echo    • Disable Windows Firewall temporarily
echo    • Try different browser on phone
echo.
echo 🔄 To restore original settings:
echo    copy config-backup\frontend.env.backup frontend\.env
echo    copy config-backup\backend.env.backup backend\.env
echo.
echo ========================================
echo  🎯 PROFILE FEATURES AVAILABLE
echo ========================================
echo.
echo 👤 Student Profile:
echo    • Edit personal information
echo    • Upload profile picture  
echo    • Manage address details
echo    • Update bio and preferences
echo.
echo 👨‍🏫 Tutor Profile:
echo    • Personal information tab
echo    • Tutor information tab
echo    • Subject and pricing management
echo    • Education and languages
echo    • Professional statistics
echo.
echo Both profiles are fully mobile-responsive!
echo.
pause