# Install dependencies only when needed
FROM node:latest
# RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
# RUN ln -s /usr/bin/python3 /usr/bin/python
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

RUN npm install -g npm@latest

WORKDIR /usr/src/app

COPY . . 

RUN npm install

# RUN npm run build

ENTRYPOINT [ "npm", "run", "dev" ]