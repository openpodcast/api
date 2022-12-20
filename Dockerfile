FROM node:16-slim as builder

RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# create root application folder
WORKDIR /app

# copy configs to /app folder
COPY package*.json ./

# Install dependencies including dev dependencies (for build)
RUN yarn install --frozen-lockfile --verbose --network-timeout 600000

COPY tsconfig.json ./
COPY src /app/src
COPY views /app/views

RUN yarn build

# Cleanup unused dev dependencies
# This is need as the whole node_modules folder is copied to the next stage
RUN yarn install --frozen-lockfile --production --verbose --network-timeout 600000

FROM node:16-slim

# Install nodemon
RUN npm install -g nodemon

# create root application folder
WORKDIR /app

# copy configs to /app folder
COPY views /app/views
COPY public /app/public

# copy builded files from builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules 

EXPOSE 8080

CMD [ "nodemon", "./dist/index.js" ]
