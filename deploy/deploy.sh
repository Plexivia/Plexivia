#!/usr/bin/env bash
# ==============================================================================
# 🚀 Plexivia Microservices Automated VPS Deployment Script (v2.0.0)
# ==============================================================================
set -euo pipefail

echo "==============================================================="
echo "🔄 Starting Plexivia Production Deployment (v2.0.0)"
echo "📅 $(date)"
echo "==============================================================="

APP_DIR="/opt/plexivia"
WWW_ADMIN_DIR="/var/www/plexivia/admin"
WWW_WEBSITE_DIR="/var/www/plexivia/website"

cd "$APP_DIR"

# 1. Pull Latest Code
echo "📥 Pulling latest git updates..."
git pull origin main || git pull origin Live || git pull origin temp

# 2. Build Backend & Microservices
echo "🔨 Installing workspace dependencies & building..."
npm install --include=optional

echo "🔨 Building backend gateway..."
cd "$APP_DIR/backend"
npm run build

echo "🔨 Building microservices..."
for svc in auth-service hub-service agency-service finance-service; do
  if [ -d "$APP_DIR/services/$svc" ]; then
    echo "  -> Building $svc..."
    cd "$APP_DIR/services/$svc"
    npm run build
  fi
done

# 3. Build Admin Frontend
echo "🌐 Building Admin Dashboard..."
cd "$APP_DIR/admin"
npm run build
mkdir -p "$WWW_ADMIN_DIR"
rsync -av --delete dist/ "$WWW_ADMIN_DIR/"

# 4. Build Website Frontend
echo "🌐 Building Corporate Website..."
cd "$APP_DIR/website"
npm run build
mkdir -p "$WWW_WEBSITE_DIR"
rsync -av --delete dist/ "$WWW_WEBSITE_DIR/"

# 5. Restart Systemd Daemons
echo "🔄 Restarting Systemd Backend Services..."
systemctl daemon-reload
systemctl restart plexivia-backend || true

for svc in plexivia-auth plexivia-hub plexivia-agency plexivia-finance; do
  if systemctl is-active --quiet "$svc"; then
    echo "  -> Restarting $svc..."
    systemctl restart "$svc"
  fi
done

# 6. Test Nginx and Reload
echo "🔄 Reloading Nginx..."
nginx -t && systemctl reload nginx

# 7. Health Check
echo "🔍 Verifying API Gateway Health..."
sleep 2
curl -s http://127.0.0.1:5095/api/health || echo "⚠️ Check backend logs: journalctl -u plexivia-backend -n 50"

echo "==============================================================="
echo "✅ Deployment Completed Successfully! (v2.0.0)"
echo "==============================================================="
