@echo off
title Travel Planner Backend Server (Port 8080)
cd /d "%~dp0"

echo ======================================================================
echo    TRAVEL PLANNER BACKEND SERVER (Pure Java SE + Port 8080)
echo ======================================================================
echo.

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
