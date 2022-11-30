FROM node:16

# Install nodemon
RUN npm install -g nodemon

# create root application folder
WORKDIR /app

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
# copy source code to /app/src folder
COPY src /app/src

RUN yarn install --network-timeout 600000
RUN yarn build

EXPOSE 7777

CMD [ "nodemon", "./dist/index.js" ]
