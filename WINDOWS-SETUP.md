# Matrix POS - Windows Setup Guide

## Running on Port 9090

You have three options to run the application on Windows:

---

## Option 1: Quick Start (No Installation Required) ⚡

**Easiest and fastest way to get started:**

```powershell
# Simply run this script
.\start-app-port-9090.ps1
```

This will:
- Start backend on port 3000
- Start frontend on port 9090
- Open browser automatically

**Access:** http://localhost:9090

To stop: Close the PowerShell windows

---

## Option 2: Install Nginx (Recommended for Production) 🚀

### Step 1: Install Nginx

```powershell
# Run as Administrator
.\install-nginx-windows.ps1
```

This will:
- Download and install Nginx to `C:\nginx`
- Configure it for port 9090
- Set up firewall rules
- Optionally create Windows service

### Step 2: Build the application

```powershell
# Build backend
cd backend
npm install
npm run build
cd ..

# Build frontend
cd frontend
npm install --legacy-peer-deps
npx ng build
cd ..
```

### Step 3: Start with Nginx

```powershell
# Start backend
cd backend
node dist/main.js

# In another terminal, start Nginx
cd C:\nginx
.\nginx.exe
```

**Or use the quick start script:**
```powershell
.\start-app-port-9090.ps1 -UseNginx
```

**Access:** http://localhost:9090

### Nginx Management Commands

```powershell
# Start Nginx
cd C:\nginx
.\nginx.exe

# Stop Nginx
.\nginx.exe -s stop

# Reload configuration
.\nginx.exe -s reload

# Test configuration
.\nginx.exe -t

# View logs
type logs\access.log
type logs\error.log
```

---

## Option 3: Windows Service with PM2 (Auto-start on boot) 🔄

### Prerequisites

```powershell
# Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebRequest('https://community.chocolatey.org/install.ps1')).DownloadString())

# Install Node.js (if not installed)
choco install nodejs -y

# Install PM2 globally
npm install -g pm2
npm install -g pm2-windows-startup
```

### Setup Service

```powershell
# Run as Administrator
.\setup-windows-service.ps1
```

This will:
- Install and configure PM2
- Build the application
- Start both backend and frontend
- Configure auto-start on Windows boot

### PM2 Management Commands

```powershell
# View status
pm2 status

# View logs
pm2 logs

# Restart all
pm2 restart all

# Stop all
pm2 stop all

# Start all
pm2 start all

# Monitor
pm2 monit

# Remove from startup
pm2 unstartup
```

---

## Port Configuration

### Current Setup
- **Backend:** http://localhost:3000/api
- **Frontend (standalone):** http://localhost:9090
- **Frontend (via Nginx):** http://localhost:9090

### Changing Ports

**Frontend port (9090 → different port):**

Edit `start-app-port-9090.ps1`:
```powershell
# Change this line:
npx http-server dist/frontend -p 9090 -c-1 -o
# To:
npx http-server dist/frontend -p 8080 -c-1 -o
```

Or edit `nginx-windows.conf`:
```nginx
server {
    listen 8080;  # Change from 9090
    ...
}
```

**Backend port (3000 → different port):**

Edit `backend/.env`:
```
PORT=5000
```

Then update nginx config:
```nginx
location /api {
    proxy_pass http://localhost:5000;  # Change from 3000
    ...
}
```

---

## Troubleshooting

### Port Already in Use

```powershell
# Find process using port 9090
netstat -ano | findstr :9090

# Kill process by PID
taskkill /PID <PID> /F
```

### Backend Won't Start

```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Check logs
cd backend
node dist/main.js
```

### Frontend Build Issues

```powershell
cd frontend
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
npx ng build
```

### Nginx Won't Start

```powershell
# Test configuration
cd C:\nginx
.\nginx.exe -t

# Check logs
type logs\error.log

# Verify paths in nginx.conf match your setup
notepad conf\nginx.conf
```

### NG0908 Error in Browser

This error means Angular directives aren't loading. Fix:

```powershell
cd frontend
# Ensure CommonModule is in app.module.ts
# Rebuild
npx ng build
# Hard refresh browser (Ctrl + Shift + R)
```

---

## Performance Tips

### 1. Use Production Build
```powershell
cd frontend
npx ng build --configuration production
```

### 2. Enable Nginx Caching
Already configured in `nginx-windows.conf`

### 3. Use PM2 Cluster Mode
Edit `ecosystem.config.js`:
```javascript
instances: 2,  // or 'max' for all CPU cores
exec_mode: 'cluster'
```

### 4. Enable HTTP/2 (requires SSL)
```nginx
listen 9090 http2;
```

---

## Firewall Configuration

### Allow Port 9090

```powershell
# As Administrator
New-NetFirewallRule -DisplayName "Matrix POS Port 9090" -Direction Inbound -LocalPort 9090 -Protocol TCP -Action Allow
```

### Allow Port 3000 (if accessing backend directly)

```powershell
New-NetFirewallRule -DisplayName "Matrix POS Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

---

## Database Setup

### SQLite (Development)
Already configured. Database created automatically at `backend/dev.sqlite`

### MySQL (Production)

1. Install MySQL:
```powershell
choco install mysql -y
```

2. Create database:
```sql
CREATE DATABASE matrix_pos;
CREATE USER 'pos_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON matrix_pos.* TO 'pos_user'@'localhost';
FLUSH PRIVILEGES;
```

3. Update `backend/.env`:
```
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=pos_user
DB_PASSWORD=your_password
DB_DATABASE=matrix_pos
```

4. Run migrations:
```powershell
cd backend
# Your migration commands here
```

---

## Backup & Restore

### Backup Database (SQLite)

```powershell
Copy-Item backend\dev.sqlite "backup\dev-$(Get-Date -Format 'yyyyMMdd-HHmmss').sqlite"
```

### Backup Database (MySQL)

```powershell
mysqldump -u pos_user -p matrix_pos > backup_$(Get-Date -Format 'yyyyMMdd').sql
```

### Automated Backup Script

Create `backup.ps1`:
```powershell
$backupDir = "C:\Backups\MatrixPOS"
New-Item -ItemType Directory -Force -Path $backupDir

# Backup database
Copy-Item backend\dev.sqlite "$backupDir\dev-$(Get-Date -Format 'yyyyMMdd-HHmmss').sqlite"

# Keep only last 7 days
Get-ChildItem $backupDir -Filter "*.sqlite" | 
    Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-7)} | 
    Remove-Item
```

Schedule with Task Scheduler to run daily.

---

## Security Checklist

- [ ] Change default JWT_SECRET in `.env`
- [ ] Use strong database password
- [ ] Enable Windows Firewall
- [ ] Keep Node.js and npm updated
- [ ] Use HTTPS in production (SSL certificate)
- [ ] Regularly backup database
- [ ] Review and update dependencies
- [ ] Monitor logs for suspicious activity

---

## Updating the Application

```powershell
# Stop services
pm2 stop all
# Or close PowerShell windows if using quick start

# Pull latest code (if using git)
git pull

# Rebuild backend
cd backend
npm install
npm run build
cd ..

# Rebuild frontend
cd frontend
npm install --legacy-peer-deps
npx ng build
cd ..

# Restart services
pm2 restart all
# Or run start script again
```

---

## Support & Resources

- **Nginx Docs:** https://nginx.org/en/docs/
- **PM2 Docs:** https://pm2.keymetrics.io/docs/
- **NestJS:** https://docs.nestjs.com/
- **Angular:** https://angular.io/docs

For issues, check logs:
- Backend: `logs/backend-error.log`
- Frontend: Browser Console (F12)
- Nginx: `C:\nginx\logs\error.log`
