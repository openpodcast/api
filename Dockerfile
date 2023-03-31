FROM node:16-slim

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
