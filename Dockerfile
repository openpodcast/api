FROM node:16-slim as builder

RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# create root application folder
WORKDIR /app

# copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
COPY src /app/src
COPY views /app/views

RUN yarn install --verbose && yarn cache clean
RUN yarn build

# Remove dev dependencies
RUN yarn install --production --verbose && yarn cache clean

FROM node:16-slim

# Install nodemon
RUN npm install -g nodemon

# create root application folder
WORKDIR /app

# copy configs to /app folder
COPY views /app/views

# copy builded files from builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules 

EXPOSE 8080

CMD [ "nodemon", "./dist/index.js" ]
