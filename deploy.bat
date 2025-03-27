@echo off
echo Building application...
call npm run build

echo Creating deployment package...
if exist deploy rmdir /s /q deploy
mkdir deploy

echo Copying files...
xcopy /E /I dist deploy\dist
xcopy /E /I collection-data deploy\collection-data
xcopy /E /I src deploy\src
xcopy /E /I pokemon-data deploy\pokemon-data
xcopy /E /I public deploy\public
copy package.json deploy\
copy package-lock.json deploy\
copy vite.config.ts deploy\
copy tsconfig.json deploy\
copy tsconfig.node.json deploy\
copy tsconfig.app.json deploy\

echo Creating service files...
echo [Unit] > deploy\pokedex-server.service
echo Description=Pokedex Backend Server >> deploy\pokedex-server.service
echo After=network.target >> deploy\pokedex-server.service
echo. >> deploy\pokedex-server.service
echo [Service] >> deploy\pokedex-server.service
echo Type=simple >> deploy\pokedex-server.service
echo User=admin >> deploy\pokedex-server.service
echo WorkingDirectory=/home/admin/pokedex >> deploy\pokedex-server.service
echo ExecStart=/usr/bin/npm run pokeserver >> deploy\pokedex-server.service
echo Restart=always >> deploy\pokedex-server.service
echo RestartSec=10 >> deploy\pokedex-server.service
echo Environment=NODE_ENV=production >> deploy\pokedex-server.service
echo Environment=PORT=3002 >> deploy\pokedex-server.service
echo Environment=DISPLAY=:0 >> deploy\pokedex-server.service
echo. >> deploy\pokedex-server.service
echo [Install] >> deploy\pokedex-server.service
echo WantedBy=multi-user.target >> deploy\pokedex-server.service

echo [Unit] > deploy\pokedex-frontend.service
echo Description=Pokedex Frontend Server >> deploy\pokedex-frontend.service
echo After=network.target >> deploy\pokedex-frontend.service
echo. >> deploy\pokedex-frontend.service
echo [Service] >> deploy\pokedex-frontend.service
echo Type=simple >> deploy\pokedex-frontend.service
echo User=admin >> deploy\pokedex-frontend.service
echo WorkingDirectory=/home/admin/pokedex >> deploy\pokedex-frontend.service
echo ExecStart=/usr/bin/npm run preview -- --host >> deploy\pokedex-frontend.service
echo Restart=always >> deploy\pokedex-frontend.service
echo RestartSec=10 >> deploy\pokedex-frontend.service
echo Environment=NODE_ENV=production >> deploy\pokedex-frontend.service
echo Environment=PORT=4173 >> deploy\pokedex-frontend.service
echo Environment=DISPLAY=:0 >> deploy\pokedex-frontend.service
echo. >> deploy\pokedex-frontend.service
echo [Install] >> deploy\pokedex-frontend.service
echo WantedBy=multi-user.target >> deploy\pokedex-frontend.service

echo Creating nginx configuration...
echo server { > deploy\nginx.conf
echo     listen 80; >> deploy\nginx.conf
echo     server_name 192.168.1.104; >> deploy\nginx.conf
echo. >> deploy\nginx.conf
echo     error_log /var/log/nginx/pokedex-error.log debug; >> deploy\nginx.conf
echo     access_log /var/log/nginx/pokedex-access.log; >> deploy\nginx.conf
echo. >> deploy\nginx.conf
echo     location / { >> deploy\nginx.conf
echo         proxy_pass http://127.0.0.1:4173; >> deploy\nginx.conf
echo         proxy_http_version 1.1; >> deploy\nginx.conf
echo         proxy_set_header Upgrade $http_upgrade; >> deploy\nginx.conf
echo         proxy_set_header Connection 'upgrade'; >> deploy\nginx.conf
echo         proxy_set_header Host $host; >> deploy\nginx.conf
echo         proxy_cache_bypass $http_upgrade; >> deploy\nginx.conf
echo     } >> deploy\nginx.conf
echo. >> deploy\nginx.conf
echo     location /api { >> deploy\nginx.conf
echo         proxy_pass http://127.0.0.1:3002; >> deploy\nginx.conf
echo         proxy_http_version 1.1; >> deploy\nginx.conf
echo         proxy_set_header Upgrade $http_upgrade; >> deploy\nginx.conf
echo         proxy_set_header Connection 'upgrade'; >> deploy\nginx.conf
echo         proxy_set_header Host $host; >> deploy\nginx.conf
echo         proxy_cache_bypass $http_upgrade; >> deploy\nginx.conf
echo     } >> deploy\nginx.conf
echo } >> deploy\nginx.conf

echo Creating archive...
cd deploy
powershell Compress-Archive -Path * -DestinationPath ..\pokedex-deploy.zip -Force
cd ..

echo Deployment package created: pokedex-deploy.zip
echo.
echo To deploy to Raspberry Pi:
echo 1. Copy pokedex-deploy.zip to your Pi
echo 2. On the Pi, run:
echo    unzip pokedex-deploy.zip
echo    cd deploy
echo    npm install
echo    sudo cp pokedex-server.service /etc/systemd/system/
echo    sudo cp pokedex-frontend.service /etc/systemd/system/
echo    sudo cp nginx.conf /etc/nginx/sites-available/pokedex
echo    sudo ln -sf /etc/nginx/sites-available/pokedex /etc/nginx/sites-enabled/
echo    sudo rm -f /etc/nginx/sites-enabled/default
echo    sudo nginx -t
echo    sudo systemctl reload nginx
echo    sudo systemctl daemon-reload
echo    sudo systemctl enable pokedex-server pokedex-frontend
echo    sudo systemctl start pokedex-server pokedex-frontend 