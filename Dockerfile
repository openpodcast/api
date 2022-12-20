FROM node:16-slim

RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install nodemon
RUN npm install -g nodemon

# create root application folder
WORKDIR /app

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
COPY src /app/src
COPY views /app/views

RUN yarn install --verbose && yarn cache clean
RUN yarn build

EXPOSE 7777

CMD [ "nodemon", "./dist/index.js" ]
