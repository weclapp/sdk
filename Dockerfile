FROM node:14

WORKDIR /usr/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .
