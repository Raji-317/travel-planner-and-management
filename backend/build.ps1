# Build script for Pure Core Java Backend (No Maven / No Gradle)
$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Compiling Pure Java Backend with javac          " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Gather all .java source files
Get-ChildItem -Recurse -Filter *.java src | ForEach-Object { $_.FullName } | Set-Content sources.txt

# Compile using javac (quote "@sources.txt" for PowerShell)
javac -cp ".;lib/*" -d out "@sources.txt"

Write-Host "[SUCCESS] Pure Java backend compiled into out/" -ForegroundColor Green
Write-Host "Run with: powershell ./run.ps1" -ForegroundColor Yellow
