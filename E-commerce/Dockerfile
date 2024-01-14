FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . /app
RUN ls -al 
EXPOSE 4005
CMD ["node", "index.js"]
