@echo off
echo ========================================
echo  CHECKING TUTORS IN DATABASE
echo ========================================
echo.

node check-tutors.js

echo.
echo ========================================
echo  NEXT STEPS
echo ========================================
echo.
echo If no tutors are visible to students:
echo.
echo 1️⃣  Register as a tutor:
echo    - Go to registration page
echo    - Select "I want to become a tutor"
echo    - Complete registration and email verification
echo    - Fill out tutor application form
echo.
echo 2️⃣  Run setup script:
echo    setup-tutors.bat
echo.
echo 3️⃣  Test as student:
echo    - Login as student
echo    - Click "Find a Tutor" or "Book a Session"
echo    - You should see the registered tutors!
echo.

pause