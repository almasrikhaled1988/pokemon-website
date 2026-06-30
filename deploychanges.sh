#!/bin/bash

# Configuration
PROJECT_ROOT="/home/kh/APPS/pokemon-website"
DEPLOY_DIR="/var/www/pokedex"
SERVICE_NAME="pokemon-website"

echo "🚀 Starting Pokemon Website Deployment..."

# 1. Navigate to project
cd $PROJECT_ROOT

# 2. Install dependencies (in case of new ones)
echo "📥 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed. Aborting deployment."
    exit 1
fi

# 3. Build Frontend
echo "📦 Building Frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed. Aborting deployment."
    exit 1
fi

# 4. Deploy Static Files to Nginx
echo "🚚 Moving static files to $DEPLOY_DIR..."
sudo mkdir -p "$DEPLOY_DIR"
sudo cp -rv dist/* "$DEPLOY_DIR/"

# 5. Restart Backend Service
echo "⚙️ Restarting backend service..."
if systemctl list-unit-files | grep -q "$SERVICE_NAME"; then
    sudo systemctl restart "$SERVICE_NAME"
    sleep 2
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo "✅ Backend service restarted successfully"
    else
        echo "⚠️  Backend service failed to start. Check: sudo systemctl status $SERVICE_NAME"
    fi
else
    echo "ℹ️  No systemd service found for '$SERVICE_NAME'."
    echo "   Attempting to restart with pm2..."
    if command -v pm2 &> /dev/null; then
        pm2 restart "$SERVICE_NAME" 2>/dev/null || pm2 start server.js --name "$SERVICE_NAME"
        echo "✅ Backend restarted via pm2"
    else
        echo "⚠️  No process manager found. Start manually with: node server.js"
    fi
fi

# 6. Reload Nginx
echo "🔄 Reloading Nginx..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx config test failed. Check your nginx configuration."
    exit 1
fi

sudo systemctl reload nginx
echo "✅ Nginx reloaded"

echo ""
echo "✅ Pokemon Website Deployment Complete!"
