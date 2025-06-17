#!/usr/bin/env powershell

Write-Host "🚀 Starting Netflix Recommendation Hub Development Servers..." -ForegroundColor Green

# Create new terminal for backend
Write-Host "📱 Starting Backend Server (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd h:\Documents\py\pdds\backend && npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Create new terminal for frontend
Write-Host "🌐 Starting Frontend Server (Port 5173)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd h:\Documents\py\pdds\frontend && npm run dev"

Write-Host "✅ Both servers should be starting in separate terminals." -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Blue
Write-Host "Press any key to exit this script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
