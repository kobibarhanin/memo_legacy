FROM node:14

WORKDIR /home/memo

COPY . .

RUN npm -g install . 
