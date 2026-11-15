@echo off
title Travel Planner Backend Server (Port 8080)
cd /d "%~dp0"

echo ======================================================================
echo    TRAVEL PLANNER BACKEND SERVER (Pure Java SE + Port 8080)
echo ======================================================================
echo.

:: Automatically free port 8080 if a previous instance is still running
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo [INFO] Port 8080 is currently held by PID %%a. Closing previous process...
    taskkill /f /pid %%a >nul 2>&1
)

if not exist out mkdir out

echo [1/2] Compiling backend sources...
dir /s /b src\*.java > sources.txt
javac -cp "lib/*" -d out @sources.txt
if errorlevel 1 (
    echo [ERROR] Compilation failed. Ensure JDK is installed and in PATH.
    pause
    exit /b %errorlevel%
)

echo [2/2] Launching com.travel.Main on http://localhost:8080 ...
echo.
java -cp "out;lib/*" com.travel.Main
pause
