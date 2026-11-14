# Database initialization script for Windows PowerShell
$env:Path += ";C:\Program Files\MySQL\MySQL Server 8.0\bin"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Initializing MySQL Database: travel_planner_db  " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`nPlease enter your MySQL root password when prompted by MySQL." -ForegroundColor Yellow
Write-Host "[1/2] Creating database and tables (schema.sql)..." -ForegroundColor Cyan

Get-Content schema.sql -Raw -Encoding UTF8 | mysql -u root -p
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Failed to execute schema.sql. Please verify your MySQL password and retry." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n[2/2] Loading sample seed data (sample_data.sql)..." -ForegroundColor Cyan
Get-Content sample_data.sql -Raw -Encoding UTF8 | mysql -u root -p travel_planner_db
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Failed to execute sample_data.sql. Please retry." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n[SUCCESS] Database and sample seed data loaded successfully!" -ForegroundColor Green
Write-Host "`nVerifying Table Counts:" -ForegroundColor Cyan
mysql -u root -p -e "USE travel_planner_db; SELECT 'Users' as Entity, COUNT(*) as Count FROM users UNION SELECT 'Destinations', COUNT(*) FROM destinations UNION SELECT 'Packages', COUNT(*) FROM packages UNION SELECT 'Attractions', COUNT(*) FROM attractions;"
