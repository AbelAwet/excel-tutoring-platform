@echo off
echo Testing Password Reset System
echo =============================

echo.
echo 1. Testing forgot password endpoint...
curl -X POST http://localhost:5000/api/v1/auth/forgot-password ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"abelab805@gmail.com\"}"

echo.
echo.
echo 2. Check your email for the OTP, then test reset password...
echo    Use this command with your actual OTP:
echo.
echo curl -X POST http://localhost:5000/api/v1/auth/reset-password ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"email\":\"abelab805@gmail.com\",\"otp\":\"YOUR_OTP_HERE\",\"password\":\"newpassword123\"}"

pause