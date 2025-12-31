@echo off
echo ========================================
echo  AUTO-VERIFY TUTORS FOR TESTING
echo ========================================
echo.

echo 🔍 Checking for pending tutors...
node auto-verify-tutors.js

echo.
echo ========================================
echo  NEXT STEPS
echo ========================================
echo.
echo 1️⃣  Refresh your student dashboard
echo 2️⃣  Go to "Browse Tutors" 
echo 3️⃣  You should now see the registered tutors!
echo.
echo 📝 Note: This is for development testing only.
echo    In production, tutors should be manually verified by admins.
echo.

pause