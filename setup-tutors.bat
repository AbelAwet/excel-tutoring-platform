@echo off
echo ========================================
echo  SETUP TUTORS AND SUBJECTS
echo ========================================
echo.

echo 🚀 Setting up sample data and verifying tutors...
echo.

node setup-sample-data.js

echo.
echo ========================================
echo  TESTING INSTRUCTIONS
echo ========================================
echo.
echo 📱 FOR STUDENTS:
echo 1. Login as a student
echo 2. Go to "Browse Tutors" or "Find Tutors"
echo 3. You should now see verified tutors!
echo 4. Click on a tutor to view their profile
echo 5. Book a session with them
echo.
echo 👨‍🏫 FOR TUTORS:
echo 1. Register as a tutor (if not already done)
echo 2. Complete your tutor profile
echo 3. Add subjects you want to teach
echo 4. Set your hourly rates
echo 5. Your profile will be visible to students
echo.
echo 🔄 If you still don't see tutors:
echo 1. Make sure the tutor completed their profile
echo 2. Check that subjects are added to their profile
echo 3. Refresh the student dashboard
echo 4. Try different search filters
echo.

pause