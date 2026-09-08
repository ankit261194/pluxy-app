#!/usr/bin/env bash
# ==============================================================================
# Pluxy Social Super-App - Automated One-Click VPS Deployment Script
# Designed for Hostinger VPS (Ubuntu 20.04 / 22.04 / 24.04 or Debian 11/12)
# Works directly with IP address, Hostinger Preview URL, or Custom Domain
# ==============================================================================

set -e

echo "=========================================================="
echo "    PLUXY SOCIAL SUPER-APP - HOSTINGER VPS DEPLOYMENT     "
echo "=========================================================="

if [ "$EUID" -ne 0 ]; then
  echo "Error: Please run this script as root (use: sudo bash setup_vps.sh)"
  exit 1
fi

APP_DIR="/var/www/pluxy"
REPO_URL="https://github.com/ankit261194/pluxy-app.git"

echo "[1/6] Updating system packages and installing prerequisites..."
apt-get update -y
apt-get install -y python3 python3-pip python3-venv git nginx curl ufw

echo "[2/6] Setting up project directory at ${APP_DIR}..."
mkdir -p /var/www
if [ -d "${APP_DIR}/.git" ]; then
    echo "Updating existing repository..."
    cd "${APP_DIR}"
    git fetch origin main
    git reset --hard origin/main
else
    echo "Cloning Pluxy repository from GitHub..."
    rm -rf "${APP_DIR}"
    git clone "${REPO_URL}" "${APP_DIR}"
    cd "${APP_DIR}"
fi

# Ensure data and upload directories exist with proper permissions
mkdir -p "${APP_DIR}/data"
mkdir -p "${APP_DIR}/data/uploads"
chmod -R 755 "${APP_DIR}/data"

echo "[3/6] Setting up Python virtual environment and installing backend requirements..."
if [ ! -d "${APP_DIR}/venv" ]; then
    python3 -m venv "${APP_DIR}/venv"
fi
"${APP_DIR}/venv/bin/pip" install --upgrade pip
"${APP_DIR}/venv/bin/pip" install -r "${APP_DIR}/requirements.txt"

echo "[4/6] Installing and starting systemd background service (pluxy.service)..."
cp "${APP_DIR}/hostinger/pluxy.service" /etc/systemd/system/pluxy.service
systemctl daemon-reload
systemctl enable pluxy
systemctl restart pluxy

echo "[5/6] Configuring Nginx reverse proxy with WebSocket support..."
cp "${APP_DIR}/hostinger/nginx_pluxy.conf" /etc/nginx/sites-available/pluxy.conf
ln -sf /etc/nginx/sites-available/pluxy.conf /etc/nginx/sites-enabled/pluxy.conf
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration syntax
nginx -t
systemctl reload nginx

echo "[6/6] Configuring firewall (UFW)..."
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw allow 22/tcp || true

# Get Server Public IP
SERVER_IP=$(curl -s https://api.ipify.org || curl -s http://checkip.amazonaws.com || hostname -I | awk '{print $1}')

echo ""
echo "=========================================================="
echo "          PLUXY APP SUCCESSFULLY DEPLOYED!                "
echo "=========================================================="
echo "Access Pluxy right now directly via Server IP:"
echo "👉 http://${SERVER_IP}"
echo ""
echo "API Health Check:"
echo "👉 http://${SERVER_IP}/api/health"
echo ""
echo "Service Status:"
systemctl status pluxy --no-pager | head -n 12
echo ""
echo "To attach a custom domain in the future with free SSL:"
echo "1. Point your domain's DNS A Record to: ${SERVER_IP}"
echo "2. Run: apt install -y certbot python3-certbot-nginx && certbot --nginx -d yourdomain.com"
echo "=========================================================="
