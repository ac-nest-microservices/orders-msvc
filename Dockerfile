FROM ubuntu:latest
LABEL authors="angelcruz"

FROM node:20-alpine3.20

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

EXPOSE 3002

CMD [ "pnpm", "run", "start:dev" ]