@echo off
title Sign Language Recognition Platform - Startup Script
color 0A

echo.
echo ========================================
echo   Sign Language Recognition Platform
echo ========================================
echo.

echo Checking prerequisites...
echo.

REM Check if XAMPP is running
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Apache is running
) else (
    echo [WARNING] Apache not detected - please start XAMPP
)

tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MySQL is running
) else (
    echo [WARNING] MySQL not detected - please start XAMPP
)

echo.
echo Starting services...
echo.

REM Start Python ML Backend
echo [1/3] Starting Python ML Backend...
start "ML Backend" cmd /k "cd /d D:\class\lang\python_ml && echo Starting Python ML Backend... && python test_recognition.py && echo. && echo ML Backend is ready! Press any key to continue... && pause"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Flask API
echo [2/3] Starting Flask API...
start "Flask API" cmd /k "cd /d D:\class\lang\flask_api && echo Starting Flask API... && python app.py"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start React Frontend
echo [3/3] Starting React Frontend...
start "React Frontend" cmd /k "cd /d D:\class\lang\react_frontend && echo Starting React Frontend... && npm start"

echo.
echo ========================================
echo   All services are starting...
echo ========================================
echo.
echo Access URLs:
echo   React Frontend:  http://localhost:3000
echo   PHP Backend:     http://localhost/sign_language_platform
echo   Flask API:       http://localhost:5000
echo   phpMyAdmin:      http://localhost/phpmyadmin
echo.
echo Press any key to open the main application...
pause >nul

REM Open the main application
start http://localhost:3000

echo.
echo Application opened in browser!
echo Keep this window open to monitor the startup process.
echo.
echo Press any key to exit...
pause >nul
