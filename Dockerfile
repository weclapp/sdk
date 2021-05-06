FROM registry.internal.weclapp.com/weclapp_ops/base_images/node:latest-14-alpine-npm7

WORKDIR /usr/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .
