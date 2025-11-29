# PowerShell script to set up Matrix POS as Windows Services
# Run as Administrator
# Requires: Node.js, pm2-installer (or node-windows)

$ErrorActionPreference = "Stop"

Write-Host "=== Matrix POS - Windows Service Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

# Install PM2 globally if not installed
Write-Host "Step 1: Checking PM2 installation..." -ForegroundColor Yellow
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "  Installing PM2..." -ForegroundColor Cyan
    npm install -g pm2
    npm install -g pm2-windows-startup
    Write-Host "  PM2 installed" -ForegroundColor Green
} else {
    Write-Host "  PM2 already installed" -ForegroundColor Green
}

# Configure PM2 for Windows startup
Write-Host "Step 2: Configuring PM2 for Windows startup..." -ForegroundColor Yellow
pm2-startup install
Write-Host "  PM2 startup configured" -ForegroundColor Green

# Build application
Write-Host "Step 3: Building application..." -ForegroundColor Yellow

# Build backend
Write-Host "  Building backend..." -ForegroundColor Cyan
Push-Location backend
npm install
npm run build
Pop-Location
Write-Host "  Backend built successfully" -ForegroundColor Green

# Build frontend
Write-Host "  Building frontend..." -ForegroundColor Cyan
Push-Location frontend
npm install --legacy-peer-deps
npx ng build
Pop-Location
Write-Host "  Frontend built successfully" -ForegroundColor Green

# Create PM2 ecosystem file for Windows
Write-Host "Step 4: Creating PM2 configuration..." -ForegroundColor Yellow
$pm2Config = @"
module.exports = {
  apps: [
    {
      name: 'matrix-pos-backend',
      script: './backend/dist/main.js',
      cwd: '$PWD',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true
    }
  ]
};
"@
$pm2Config | Out-File -FilePath "ecosystem.config.js" -Encoding UTF8
Write-Host "  PM2 configuration created" -ForegroundColor Green

# Create logs directory
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

# Start application with PM2
Write-Host "Step 5: Starting application with PM2..." -ForegroundColor Yellow
pm2 delete all -s 2>$null
pm2 start ecosystem.config.js
pm2 save
Write-Host "  Application started" -ForegroundColor Green

# Setup frontend server (using http-server as Windows service)
Write-Host "Step 6: Setting up frontend server..." -ForegroundColor Yellow

# Install http-server globally
if (-not (Get-Command http-server -ErrorAction SilentlyContinue)) {
    npm install -g http-server
}

# Add frontend to PM2
$frontendConfig = @"
module.exports = {
  apps: [
    {
      name: 'matrix-pos-frontend',
      script: 'http-server',
      args: 'frontend/dist/frontend -p 4200 -c-1',
      cwd: '$PWD',
      instances: 1,
      autorestart: true,
      watch: false,
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log'
    }
  ]
};
"@
$frontendConfig | Out-File -FilePath "frontend-ecosystem.config.js" -Encoding UTF8

pm2 start frontend-ecosystem.config.js
pm2 save

Write-Host "  Frontend server configured" -ForegroundColor Green

# Display status
Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
pm2 status
Write-Host ""
Write-Host "Application URLs:" -ForegroundColor Cyan
Write-Host "  Backend API: http://localhost:3000/api" -ForegroundColor White
Write-Host "  Frontend: http://localhost:4200" -ForegroundColor White
if (Test-Path "C:\nginx") {
    Write-Host "  Nginx (if running): http://localhost:9090" -ForegroundColor White
}
Write-Host ""
Write-Host "PM2 Commands:" -ForegroundColor Yellow
Write-Host "  View status:  pm2 status" -ForegroundColor White
Write-Host "  View logs:    pm2 logs" -ForegroundColor White
Write-Host "  Restart app:  pm2 restart all" -ForegroundColor White
Write-Host "  Stop app:     pm2 stop all" -ForegroundColor White
Write-Host "  Monitor:      pm2 monit" -ForegroundColor White
Write-Host ""
Write-Host "The application will now start automatically on Windows boot!" -ForegroundColor Green
