#!/bin/sh
set -e

# Default backend URL if not provided
BACKEND_URL=${BACKEND_URL:-http://localhost:8000}

# Log the backend URL being used
echo "Configuring nginx with BACKEND_URL: ${BACKEND_URL}"

# Replace placeholder in nginx.conf with actual backend URL
sed -i "s|BACKEND_URL_PLACEHOLDER|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

# Verify the replacement worked
if grep -q "BACKEND_URL_PLACEHOLDER" /etc/nginx/conf.d/default.conf; then
    echo "ERROR: Failed to replace BACKEND_URL_PLACEHOLDER in nginx config"
    exit 1
fi

echo "Nginx configuration updated successfully"

# Execute the main command
exec "$@"

