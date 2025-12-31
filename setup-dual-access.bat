@echo off
echo ========================================
echo  DUAL ACCESS SETUP (PC + Mobile)
echo ========================================
echo.

echo 🔍 Finding your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set "ip=%%a"
    goto :found
)

:found
REM Remove leading spaces
for /f "tokens=* delims= " %%a in ("%ip%") do set ip=%%a

echo ✅ Your IP address: %ip%
echo.

echo 🔧 Creating mobile-specific environment file...

REM Create a mobile version of the frontend env
(
echo # API Configuration - MOBILE VERSION
echo VITE_API_URL=http://%ip%:5000/api/v1
echo VITE_SOCKET_URL=http://%ip%:5000
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
) > frontend\.env.mobile

echo ✅ Created frontend\.env.mobile with IP: %ip%
echo.

echo 📋 INSTRUCTIONS:
echo.
echo 🖥️  FOR PC USE (localhost):
echo    1. Keep using your current setup
echo    2. Login/signup works as normal
echo    3. No changes needed
echo.
echo 📱 FOR MOBILE USE:
echo    1. Run: switch-to-mobile.bat
echo    2. Restart frontend server
echo    3. Use phone to access: http://%ip%:5173
echo    4. Login/signup will work on mobile
echo.
echo 🔄 TO SWITCH BACK TO PC:
echo    1. Run: switch-to-pc.bat
echo    2. Restart frontend server
echo    3. PC access restored
echo.

REM Create switch scripts
echo Creating switch scripts...

REM Switch to mobile script
(
echo @echo off
echo echo Switching to MOBILE configuration...
echo copy "frontend\.env" "frontend\.env.pc.backup" ^>nul 2^>^&1
echo copy "frontend\.env.mobile" "frontend\.env" ^>nul 2^>^&1
echo echo ✅ Switched to mobile configuration
echo echo 🔄 RESTART frontend server: cd frontend ^&^& npm run dev
echo echo 📱 Access from phone: http://%ip%:5173
echo pause
) > switch-to-mobile.bat

REM Switch to PC script
(
echo @echo off
echo echo Switching to PC configuration...
echo if exist "frontend\.env.pc.backup" ^(
echo     copy "frontend\.env.pc.backup" "frontend\.env" ^>nul 2^>^&1
echo     echo ✅ Restored PC configuration
echo ^) else ^(
echo     echo # API Configuration - PC VERSION ^> frontend\.env
echo     echo VITE_API_URL=http://localhost:5000/api/v1 ^>^> frontend\.env
echo     echo VITE_SOCKET_URL=http://localhost:5000 ^>^> frontend\.env
echo     echo. ^>^> frontend\.env
echo     echo # App Configuration ^>^> frontend\.env
echo     echo VITE_APP_NAME=EXCEL Tutoring Service ^>^> frontend\.env
echo     echo VITE_APP_DESCRIPTION=Find and book qualified tutors for personalized learning ^>^> frontend\.env
echo     echo. ^>^> frontend\.env
echo     echo # Feature Flags ^>^> frontend\.env
echo     echo VITE_ENABLE_CHAT=true ^>^> frontend\.env
echo     echo VITE_ENABLE_NOTIFICATIONS=true ^>^> frontend\.env
echo     echo. ^>^> frontend\.env
echo     echo # Payment ^>^> frontend\.env
echo     echo VITE_TELEBIRR_ENABLED=true ^>^> frontend\.env
echo     echo. ^>^> frontend\.env
echo     echo # File Upload ^>^> frontend\.env
echo     echo VITE_MAX_FILE_SIZE=5242880 ^>^> frontend\.env
echo     echo VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf ^>^> frontend\.env
echo     echo ✅ Created PC configuration
echo ^)
echo echo 🔄 RESTART frontend server: cd frontend ^&^& npm run dev
echo echo 🖥️  Access from PC: http://localhost:5173
echo pause
) > switch-to-pc.bat

echo ✅ Created switch-to-mobile.bat
echo ✅ Created switch-to-pc.bat
echo.

echo ========================================
echo  🚀 QUICK START FOR MOBILE
echo ========================================
echo.
echo 1️⃣  Run: switch-to-mobile.bat
echo 2️⃣  Restart frontend: cd frontend ^&^& npm run dev
echo 3️⃣  Access from phone: http://%ip%:5173
echo 4️⃣  Login/signup will work!
echo.
echo 🔄 To switch back: switch-to-pc.bat
echo.

pause