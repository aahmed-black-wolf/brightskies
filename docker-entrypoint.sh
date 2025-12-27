#!/bin/sh
set -e

# Default backend URL if not provided
BACKEND_URL=${BACKEND_URL:-http://localhost:8000}

# Replace placeholder in nginx.conf with actual backend URL
sed -i "s|BACKEND_URL_PLACEHOLDER|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

# Execute the main command
exec "$@"

