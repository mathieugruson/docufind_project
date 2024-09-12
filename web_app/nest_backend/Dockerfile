FROM node:latest

WORKDIR /usr/src/app

COPY . .

RUN apt-get update && apt-get install -y \
# OCR dependencies
graphicsmagick ghostscript \ 
python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install Puppeteer dependencies
RUN apt-get update && apt-get install -y wget gnupg2 ca-certificates \
    fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 \
    libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils \
    libpango-1.0-0 libgbm-dev libxss1

RUN npm install -g npm@latest

RUN npm install

ENTRYPOINT ["sh", "./entry_point_server.sh"]
