FROM node:16

# create root application folder
WORKDIR /app

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
# copy source code to /app/src folder
COPY src /app/src

RUN yarn install
RUN yarn build

EXPOSE 7777

CMD [ "node", "./dist/index.js" ]