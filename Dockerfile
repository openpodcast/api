FROM node:16

# Install nodemon
RUN npm install -g nodemon

# create root application folder
WORKDIR /app

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
COPY src /app/src
COPY views /app/views

RUN yarn install --network-timeout 600000
RUN yarn build

EXPOSE 7777

CMD [ "nodemon", "./dist/index.js" ]
