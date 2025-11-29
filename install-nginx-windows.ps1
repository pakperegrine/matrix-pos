# PowerShell script to install and configure Nginx on Windows
# Run as Administrator

$ErrorActionPreference = "Stop"

Write-Host "=== Matrix POS - Nginx Installation for Windows ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$nginxVersion = "1.24.0"
$nginxUrl = "http://nginx.org/download/nginx-$nginxVersion.zip"
$installPath = "C:\nginx"
$downloadPath = "$env:TEMP\nginx.zip"

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Download Nginx
Write-Host "Step 1: Downloading Nginx $nginxVersion..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $nginxUrl -OutFile $downloadPath
    Write-Host "  Downloaded successfully" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Failed to download Nginx" -ForegroundColor Red
    Write-Host "  You can manually download from: $nginxUrl" -ForegroundColor Yellow
    exit 1
}

# Extract Nginx
Write-Host "Step 2: Extracting Nginx..." -ForegroundColor Yellow
if (Test-Path $installPath) {
    Write-Host "  Nginx directory already exists. Removing..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $installPath
}

Expand-Archive -Path $downloadPath -DestinationPath "C:\" -Force
Rename-Item -Path "C:\nginx-$nginxVersion" -NewName "nginx"
Write-Host "  Extracted to $installPath" -ForegroundColor Green

# Copy configuration
Write-Host "Step 3: Configuring Nginx..." -ForegroundColor Yellow
Copy-Item -Path "nginx-windows.conf" -Destination "$installPath\conf\nginx.conf" -Force
Write-Host "  Configuration copied" -ForegroundColor Green

# Create logs directory
New-Item -ItemType Directory -Force -Path "$installPath\logs" | Out-Null

# Test Nginx configuration
Write-Host "Step 4: Testing Nginx configuration..." -ForegroundColor Yellow
$testResult = & "$installPath\nginx.exe" -t 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Configuration is valid" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Configuration test failed" -ForegroundColor Red
    Write-Host $testResult
    exit 1
}

# Create Windows Service using NSSM (recommended) or Task Scheduler
Write-Host "Step 5: Setting up Nginx as Windows Service..." -ForegroundColor Yellow

# Check if NSSM is available
if (Get-Command nssm -ErrorAction SilentlyContinue) {
    Write-Host "  Using NSSM to create service..." -ForegroundColor Cyan
    
    # Stop and remove existing service if it exists
    $service = Get-Service -Name "nginx" -ErrorAction SilentlyContinue
    if ($service) {
        & nssm stop nginx
        & nssm remove nginx confirm
    }
    
    # Install Nginx service
    & nssm install nginx "$installPath\nginx.exe"
    & nssm set nginx AppDirectory $installPath
    & nssm set nginx DisplayName "Nginx Web Server"
    & nssm set nginx Description "Nginx web server for Matrix POS"
    & nssm set nginx Start SERVICE_AUTO_START
    
    # Start the service
    & nssm start nginx
    Write-Host "  Nginx service installed and started" -ForegroundColor Green
    
} else {
    Write-Host "  NSSM not found. Creating scheduled task instead..." -ForegroundColor Yellow
    Write-Host "  For automatic startup, install NSSM: choco install nssm" -ForegroundColor Cyan
    
    # Create startup script
    $startupScript = @"
cd $installPath
start nginx.exe
"@
    $startupScript | Out-File -FilePath "$installPath\start-nginx.bat" -Encoding ASCII
    
    Write-Host "  Created startup script: $installPath\start-nginx.bat" -ForegroundColor Green
    Write-Host "  You can run this script to start Nginx manually" -ForegroundColor Yellow
}

# Add to Windows Firewall
Write-Host "Step 6: Adding firewall rule..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "Nginx Port 9090" -ErrorAction SilentlyContinue
if (-not $firewallRule) {
    New-NetFirewallRule -DisplayName "Nginx Port 9090" -Direction Inbound -LocalPort 9090 -Protocol TCP -Action Allow | Out-Null
    Write-Host "  Firewall rule added for port 9090" -ForegroundColor Green
} else {
    Write-Host "  Firewall rule already exists" -ForegroundColor Green
}

# Cleanup
Remove-Item -Path $downloadPath -Force

Write-Host ""
Write-Host "=== Installation Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Nginx is installed at: $installPath" -ForegroundColor Cyan
Write-Host "Configuration file: $installPath\conf\nginx.conf" -ForegroundColor Cyan
Write-Host "Access logs: $installPath\logs\access.log" -ForegroundColor Cyan
Write-Host "Error logs: $installPath\logs\error.log" -ForegroundColor Cyan
Write-Host ""
Write-Host "Application will be available at: http://localhost:9090" -ForegroundColor Green
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  Start Nginx:   cd C:\nginx; .\nginx.exe" -ForegroundColor White
Write-Host "  Stop Nginx:    cd C:\nginx; .\nginx.exe -s stop" -ForegroundColor White
Write-Host "  Reload config: cd C:\nginx; .\nginx.exe -s reload" -ForegroundColor White
Write-Host "  Test config:   cd C:\nginx; .\nginx.exe -t" -ForegroundColor White
Write-Host ""
Write-Host "To install NSSM (for Windows Service):" -ForegroundColor Yellow
Write-Host "  choco install nssm" -ForegroundColor White
Write-Host "  Then re-run this script" -ForegroundColor White
