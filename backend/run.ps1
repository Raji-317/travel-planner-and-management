# Run script for Pure Core Java Backend
# Ensure password is set to root
$env:DB_PASSWORD = "root"

Write-Host "==================================================" -ForegroundColor Green
Write-Host "  Starting Pure Java HttpServer (Port 8080)       " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

java -cp "out;lib/*" com.travel.Main
