@echo off
:: Batch script to reset MySQL 8.0 root password to "root"
:: MUST BE RUN AS ADMINISTRATOR
title Reset MySQL Root Password

echo ============================================================
echo   RESET MYSQL ROOT PASSWORD TO: root
echo ============================================================
echo.

echo [1/4] Stopping MySQL80 service...
net stop MySQL80 >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/4] Preparing password reset command...
set "INIT_FILE=%TEMP%\mysql_reset_%RANDOM%.sql"
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'root'; > "%INIT_FILE%"
echo FLUSH PRIVILEGES; >> "%INIT_FILE%"

echo [3/4] Applying new password using mysqld...
start /b "" "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file="%INIT_FILE%" --console
timeout /t 6 /nobreak >nul

taskkill /f /im mysqld.exe >nul 2>&1
timeout /t 2 /nobreak >nul

if exist "%INIT_FILE%" del /f /q "%INIT_FILE%" >nul 2>&1

echo [4/4] Restarting MySQL80 service...
net start MySQL80
timeout /t 2 /nobreak >nul

echo.
echo ============================================================
echo   SUCCESS! Your MySQL root password is now: root
echo ============================================================
echo.
pause
