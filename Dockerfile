FROM node:9-slim

WORKDIR /usr/src/draw-attention-server

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --only=production

# Bundle app source
COPY src ./src

EXPOSE 3001

CMD [ "npm", "start" ]
