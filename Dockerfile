FROM node:8.11.4-alpine

WORKDIR /usr/src/app

RUN apk update && apk add bash

EXPOSE 3000