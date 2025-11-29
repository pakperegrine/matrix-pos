# Matrix POS - Deployment Guide

## Prerequisites

- Ubuntu/Debian Linux server (20.04 LTS or newer)
- Node.js 18+ and npm
- Nginx web server
- MySQL database server
- Domain name (optional but recommended)
- Root or sudo access

## Quick Deployment

### Option 1: Automated Deployment (Recommended)

1. **Upload files to server:**
   ```bash
   scp -r pos_repo/* user@your-server:/tmp/matrix-pos/
   ```

2. **Run deployment script:**
   ```bash
   ssh user@your-server
   cd /tmp/matrix-pos
   sudo bash deploy.sh
   ```

3. **Configure database:**
   ```bash
   sudo nano /var/www/matrix-pos/backend/.env
   # Update DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE
   ```

4. **Restart backend:**
   ```bash
   sudo systemctl restart matrix-pos-backend
   ```

### Option 2: Manual Deployment

#### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install MySQL
sudo apt install -y mysql-server
```

#### Step 2: Set Up Database

```bash
sudo mysql -u root -p

CREATE DATABASE matrix_pos;
CREATE USER 'pos_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON matrix_pos.* TO 'pos_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 3: Build Application

**Backend:**
```bash
cd backend
npm install
npm run build
```

**Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps
npx ng build
```

#### Step 4: Deploy Files

```bash
# Create deployment directory
sudo mkdir -p /var/www/matrix-pos/{frontend,backend,logs}

# Copy frontend build
sudo cp -r frontend/dist/frontend/* /var/www/matrix-pos/frontend/

# Copy backend build
sudo cp -r backend/dist/* /var/www/matrix-pos/backend/
sudo cp -r backend/node_modules /var/www/matrix-pos/backend/
sudo cp backend/package.json /var/www/matrix-pos/backend/

# Copy and configure environment
sudo cp backend/.env.example /var/www/matrix-pos/backend/.env
sudo nano /var/www/matrix-pos/backend/.env
```

#### Step 5: Configure Nginx

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/matrix-pos

# Update server_name in the config
sudo nano /etc/nginx/sites-available/matrix-pos
# Change: server_name your-domain.com;

# Enable site
sudo ln -s /etc/nginx/sites-available/matrix-pos /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Step 6: Set Up Backend Service

**Option A: Using systemd (recommended)**

```bash
# Create service file
sudo nano /etc/systemd/system/matrix-pos-backend.service
```

Paste the following:
```ini
[Unit]
Description=Matrix POS Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/matrix-pos/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/www/matrix-pos/backend/main.js
Restart=always
RestartSec=10
StandardOutput=append:/var/www/matrix-pos/logs/backend.log
StandardError=append:/var/www/matrix-pos/logs/backend-error.log

[Install]
WantedBy=multi-user.target
```

Start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable matrix-pos-backend
sudo systemctl start matrix-pos-backend
sudo systemctl status matrix-pos-backend
```

**Option B: Using PM2 (alternative)**

```bash
# Install PM2 globally
sudo npm install -g pm2

# Copy PM2 config
sudo cp ecosystem.config.js /var/www/matrix-pos/

# Start application
cd /var/www/matrix-pos
pm2 start ecosystem.config.js

# Set up PM2 to start on boot
pm2 startup
pm2 save
```

#### Step 7: Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/matrix-pos
sudo chmod -R 755 /var/www/matrix-pos
```

## SSL Configuration (Recommended)

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (already configured, test with)
sudo certbot renew --dry-run
```

### Manual SSL Configuration

Edit `/etc/nginx/sites-available/matrix-pos` and uncomment the SSL server block, then update certificate paths.

## Post-Deployment

### Database Migration

```bash
# If you have migration files
cd /var/www/matrix-pos/backend
mysql -u pos_user -p matrix_pos < /path/to/migrations/001_init.sql
```

### Verify Deployment

```bash
# Check backend
curl http://localhost:3000/api/products

# Check frontend
curl http://localhost

# Check logs
sudo journalctl -u matrix-pos-backend -f
tail -f /var/log/nginx/access.log
```

## Updating the Application

```bash
# Pull latest code
cd /path/to/source
git pull

# Rebuild frontend
cd frontend
npm install --legacy-peer-deps
npx ng build

# Rebuild backend
cd ../backend
npm install
npm run build

# Deploy updates
sudo cp -r frontend/dist/frontend/* /var/www/matrix-pos/frontend/
sudo cp -r backend/dist/* /var/www/matrix-pos/backend/

# Restart services
sudo systemctl restart matrix-pos-backend
# OR with PM2:
pm2 restart matrix-pos-backend
```

## Monitoring

### View Logs

```bash
# Backend logs (systemd)
sudo journalctl -u matrix-pos-backend -f

# Backend logs (PM2)
pm2 logs matrix-pos-backend

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

### Service Management

```bash
# Systemd commands
sudo systemctl status matrix-pos-backend
sudo systemctl start matrix-pos-backend
sudo systemctl stop matrix-pos-backend
sudo systemctl restart matrix-pos-backend

# PM2 commands
pm2 status
pm2 restart matrix-pos-backend
pm2 stop matrix-pos-backend
pm2 logs matrix-pos-backend
pm2 monit
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
sudo journalctl -u matrix-pos-backend -n 50

# Check if port is in use
sudo lsof -i :3000

# Verify database connection
mysql -u pos_user -p matrix_pos
```

### Nginx errors

```bash
# Test configuration
sudo nginx -t

# Check error logs
tail -f /var/log/nginx/error.log

# Verify file permissions
ls -la /var/www/matrix-pos/frontend/
```

### Database connection issues

```bash
# Verify MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u pos_user -p -h localhost matrix_pos

# Check .env file
cat /var/www/matrix-pos/backend/.env
```

## Security Checklist

- [ ] Change default database password
- [ ] Generate strong JWT_SECRET
- [ ] Enable firewall (ufw)
- [ ] Install SSL certificate
- [ ] Set up regular backups
- [ ] Configure fail2ban for SSH protection
- [ ] Keep Node.js and system packages updated
- [ ] Restrict database access to localhost
- [ ] Set up monitoring and alerting
- [ ] Regular security audits

## Backup Strategy

```bash
# Database backup
mysqldump -u pos_user -p matrix_pos > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf matrix-pos-backup-$(date +%Y%m%d).tar.gz /var/www/matrix-pos

# Automated daily backup (crontab)
0 2 * * * mysqldump -u pos_user -p'password' matrix_pos > /backups/db_$(date +\%Y\%m\%d).sql
```

## Performance Optimization

1. **Enable caching in Nginx** (already configured)
2. **Use PM2 cluster mode** for multiple backend instances
3. **Set up Redis** for session management
4. **Configure database connection pooling**
5. **Enable HTTP/2** in Nginx
6. **Use CDN** for static assets (optional)

## Support

For issues and questions:
- Check logs first
- Review this documentation
- Consult NestJS and Angular documentation
- Check GitHub issues

---

**Production URL:** http://your-domain.com  
**API Endpoint:** http://your-domain.com/api  
**Admin Panel:** (To be configured)
