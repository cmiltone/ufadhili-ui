#=====
# main folder
#=====

FROM node:18.16.1 as build-stage

RUN mkdir -p /app

WORKDIR /app        

COPY package*.json yarn.lock ./

COPY .env.copy .env

RUN yarn install

COPY . .

RUN yarn build


#=====
# server folder
#=====

COPY ./server/.env.copy ./server/.env

# COPY ./server/ecosystem.config.js.copy ./server/ecosystem.config.js

WORKDIR /app/server

RUN npm install --force yarn typescript -g

# ENV PM2_PUBLIC_KEY i8zb2058az83s8f

# ENV PM2_SECRET_KEY g4o8mwf3u3285md

# RUN pm2 install pm2-logrotate

RUN yarn install

# RUN chmod +x ./start.sh

EXPOSE 4000

# RUN pm2 delete ecosystem.config.js

ENTRYPOINT ["node", "app.js"]