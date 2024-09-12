FROM node:20-alpine

WORKDIR /usr/src/app

COPY ./electron_project . 

RUN npm install

ENTRYPOINT [ "npm", "run", "dev"]
