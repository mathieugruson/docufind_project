#!/bin/sh
# Substitute environment variables in nginx.conf.template and output to nginx.conf
# Extend the envsubst command to include all required variables
envsubst '$INSTANCE_NAME $NEXTJS_PORT $NESTJS_PORT $NGINX_PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

echo "Using INSTANCE_NAME: $INSTANCE_NAME"
echo "Using NEXTJS_PORT: $NEXTJS_PORT"
echo "Using NESTJS_PORT: $NESTJS_PORT"
echo "Using NGINX_PORT: $NGINX_PORT"
cat /etc/nginx/conf.d/default.conf

# Execute the original docker-entrypoint with CMD from Dockerfile, e.g., nginx -g 'daemon off;'
exec "$@"
