FROM node:16-slim

# Accept build arguments for version information
ARG VERSION=unknown
ARG BUILD_TIME=unknown
ARG COMMIT_HASH=unknown

# Set environment variables from build arguments
ENV VERSION=${VERSION}
ENV BUILD_TIME=${BUILD_TIME}
ENV COMMIT_HASH=${COMMIT_HASH}

# Install nodemon
RUN npm install -g nodemon

# create root application folder
WORKDIR /app

COPY /node_modules /app/node_modules 
COPY views /app/views
COPY public /app/public
COPY db_schema /app/db_schema
COPY /dist /app/dist

EXPOSE 8080

CMD [ "nodemon", "./dist/index.js" ]
