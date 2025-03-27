#!/bin/bash

# Build the application
echo "Building application..."
npm run build

# Create deployment directory
echo "Creating deployment package..."
mkdir -p deploy
rm -rf deploy/*

# Copy necessary files
echo "Copying files..."
cp -r dist deploy/
cp -r collection-data deploy/
cp package.json deploy/
cp package-lock.json deploy/
cp pokedex-server.service deploy/
cp pokedex-frontend.service deploy/
cp nginx.conf deploy/

# Create a tar archive
echo "Creating archive..."
tar -czf pokedex-deploy.tar.gz -C deploy .

echo "Deployment package created: pokedex-deploy.tar.gz"
echo "To deploy to Raspberry Pi:"
echo "1. Copy pokedex-deploy.tar.gz to your Pi"
echo "2. On the Pi, run:"
echo "   tar -xzf pokedex-deploy.tar.gz"
echo "   cd deploy"
echo "   sudo cp pokedex-server.service /etc/systemd/system/"
echo "   sudo cp pokedex-frontend.service /etc/systemd/system/"
echo "   sudo cp nginx.conf /etc/nginx/sites-available/pokedex"
echo "   sudo ln -s /etc/nginx/sites-available/pokedex /etc/nginx/sites-enabled/"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl enable pokedex-server pokedex-frontend"
echo "   sudo systemctl start pokedex-server pokedex-frontend" 