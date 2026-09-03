#!/usr/bin/env bash
set -euo pipefail

SITE_ROOT="/var/www/qilylean-cn"
DEPLOY_USER="${SUDO_USER:-ubuntu}"

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nginx rsync curl ca-certificates

sudo mkdir -p "$SITE_ROOT/releases"
sudo chown -R "$DEPLOY_USER":www-data "$SITE_ROOT"
sudo chmod 2775 "$SITE_ROOT" "$SITE_ROOT/releases"

sudo rm -f /etc/nginx/sites-enabled/default

cat <<'NGINX' | sudo tee /etc/nginx/sites-available/qilylean-cn-preprod >/dev/null
server {
    listen 127.0.0.1:8080;
    server_name _;
    root /var/www/qilylean-cn/current;
    index index.html;
    charset utf-8;
    server_tokens off;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location = /robots.txt {
        add_header Cache-Control "no-cache" always;
        try_files $uri =404;
    }

    location ~* \.(?:css|js|png|jpg|jpeg|gif|webp|svg|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        try_files $uri =404;
    }

    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }

    gzip on;
    gzip_comp_level 5;
    gzip_min_length 1024;
    gzip_vary on;
    gzip_types text/plain text/css application/javascript application/json application/xml image/svg+xml;

    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header X-Frame-Options SAMEORIGIN always;
}
NGINX

sudo ln -sfn /etc/nginx/sites-available/qilylean-cn-preprod /etc/nginx/sites-enabled/qilylean-cn-preprod
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "QilyLean CN server bootstrap complete."
echo "Pre-production HTTP is bound to 127.0.0.1:8080 only; no public web port is enabled by this script."
