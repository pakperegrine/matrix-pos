# Quick start script for Matrix POS on port 9090
# This script starts the application WITHOUT Nginx (direct access)

param(
    [switch]$UseNginx = $false
)

Write-Host "=== Starting Matrix POS Application ===" -ForegroundColor Cyan
Write-Host ""

# Stop any running instances
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Stop-Process -Name nginx -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

if ($UseNginx -and (Test-Path "C:\nginx")) {
    # Start with Nginx on port 9090
    Write-Host "Starting with Nginx on port 9090..." -ForegroundColor Green
    
    # Start backend
    Write-Host "  Starting backend on port 3000..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", `
        "`$host.ui.RawUI.WindowTitle='Matrix POS - Backend'; `
        Set-Location '$PWD\backend'; `
        node dist/main.js" -WindowStyle Minimized
    
    Start-Sleep -Seconds 3
    
    # Start Nginx
    Write-Host "  Starting Nginx on port 9090..." -ForegroundColor Cyan
    Set-Location C:\nginx
    .\nginx.exe
    
    Write-Host ""
    Write-Host "Application started!" -ForegroundColor Green
    Write-Host "Access at: http://localhost:9090" -ForegroundColor Cyan
    
} else {
    # Start without Nginx - frontend on port 9090
    Write-Host "Starting without Nginx..." -ForegroundColor Green
    
    # Start backend on port 3000
    Write-Host "  Starting backend on port 3000..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", `
        "`$host.ui.RawUI.WindowTitle='Matrix POS - Backend (Port 3000)'; `
        Set-Location '$PWD\backend'; `
        Write-Host 'Backend API running at http://localhost:3000/api' -ForegroundColor Green; `
        node dist/main.js" -WindowStyle Normal
    
    Start-Sleep -Seconds 3
    
    # Start frontend on port 9090
    Write-Host "  Starting frontend on port 9090..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", `
        "`$host.ui.RawUI.WindowTitle='Matrix POS - Frontend (Port 9090)'; `
        Set-Location '$PWD\frontend'; `
        Write-Host 'Frontend running at http://localhost:9090' -ForegroundColor Green; `
        npx http-server dist/frontend -p 9090 -c-1 -o"
    
    Write-Host ""
    Write-Host "Application started!" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:9090" -ForegroundColor Cyan
    Write-Host "Backend API: http://localhost:3000/api" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Two PowerShell windows opened:" -ForegroundColor Yellow
Write-Host "  1. Backend Server" -ForegroundColor White
Write-Host "  2. Frontend Server (or Nginx)" -ForegroundColor White
Write-Host ""
Write-Host "To stop: Close the PowerShell windows or press Ctrl+C in each" -ForegroundColor Yellow
