# FROM nginx:latest


FROM nginx:latest

# WORKDIR /usr/src/app

# Install gettext-base for envsubst
RUN apt-get update && apt-get install -y gettext-base

# Copy the Nginx template
COPY ./nginx.conf.template /etc/nginx/nginx.conf.template

# Use an entrypoint script to substitute environment variables and run Nginx
COPY ./entrypoint.sh /docker-entrypoint.d
RUN chmod +x ./docker-entrypoint.d/entrypoint.sh

# ENTRYPOINT ["sh", "./entrypoint.sh"]
