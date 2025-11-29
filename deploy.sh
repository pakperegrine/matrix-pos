#!/bin/bash

# Matrix POS Deployment Script
# This script deploys the application to a production server

set -e  # Exit on error

echo "=== Matrix POS Deployment Script ==="
echo ""

# Configuration
DEPLOY_USER="www-data"
DEPLOY_PATH="/var/www/matrix-pos"
BACKEND_PORT=3000
FRONTEND_BUILD_PATH="frontend/dist/frontend"
BACKEND_BUILD_PATH="backend/dist"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Installing system dependencies...${NC}"
apt-get update
apt-get install -y nginx nodejs npm git curl

echo -e "${YELLOW}Step 2: Creating deployment directory...${NC}"
mkdir -p $DEPLOY_PATH/frontend
mkdir -p $DEPLOY_PATH/backend
mkdir -p $DEPLOY_PATH/logs

echo -e "${YELLOW}Step 3: Building frontend...${NC}"
cd frontend
npm install --legacy-peer-deps
npx ng build
cd ..

echo -e "${YELLOW}Step 4: Building backend...${NC}"
cd backend
npm install
npm run build
cd ..

echo -e "${YELLOW}Step 5: Copying files to deployment directory...${NC}"
# Copy frontend build
cp -r $FRONTEND_BUILD_PATH/* $DEPLOY_PATH/frontend/

# Copy backend build and dependencies
cp -r backend/dist/* $DEPLOY_PATH/backend/
cp -r backend/node_modules $DEPLOY_PATH/backend/
cp backend/package.json $DEPLOY_PATH/backend/
cp backend/.env.example $DEPLOY_PATH/backend/.env

echo -e "${YELLOW}Step 6: Setting up environment variables...${NC}"
cat > $DEPLOY_PATH/backend/.env << EOF
NODE_ENV=production
PORT=$BACKEND_PORT
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=pos_user
DB_PASSWORD=CHANGE_THIS_PASSWORD
DB_DATABASE=matrix_pos
JWT_SECRET=$(openssl rand -base64 32)
EOF

echo -e "${YELLOW}Step 7: Setting permissions...${NC}"
chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_PATH
chmod -R 755 $DEPLOY_PATH

echo -e "${YELLOW}Step 8: Setting up systemd service for backend...${NC}"
cat > /etc/systemd/system/matrix-pos-backend.service << EOF
[Unit]
Description=Matrix POS Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=$DEPLOY_USER
WorkingDirectory=$DEPLOY_PATH/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node $DEPLOY_PATH/backend/main.js
Restart=always
RestartSec=10
StandardOutput=append:$DEPLOY_PATH/logs/backend.log
StandardError=append:$DEPLOY_PATH/logs/backend-error.log

[Install]
WantedBy=multi-user.target
EOF

echo -e "${YELLOW}Step 9: Configuring Nginx...${NC}"
cp nginx.conf /etc/nginx/sites-available/matrix-pos
ln -sf /etc/nginx/sites-available/matrix-pos /etc/nginx/sites-enabled/matrix-pos
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

echo -e "${YELLOW}Step 10: Starting services...${NC}"
systemctl daemon-reload
systemctl enable matrix-pos-backend
systemctl start matrix-pos-backend
systemctl restart nginx

echo ""
echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo ""
echo "Backend service status:"
systemctl status matrix-pos-backend --no-pager
echo ""
echo "Nginx status:"
systemctl status nginx --no-pager
echo ""
echo -e "${GREEN}Application is now running!${NC}"
echo "Frontend: http://your-server-ip"
echo "Backend API: http://your-server-ip/api"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update database credentials in $DEPLOY_PATH/backend/.env"
echo "2. Set up MySQL database and run migrations"
echo "3. Update server_name in /etc/nginx/sites-available/matrix-pos"
echo "4. Configure SSL certificate (recommended: certbot with Let's Encrypt)"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "View backend logs: journalctl -u matrix-pos-backend -f"
echo "View nginx logs: tail -f /var/log/nginx/access.log"
echo "Restart backend: sudo systemctl restart matrix-pos-backend"
echo "Restart nginx: sudo systemctl restart nginx"
