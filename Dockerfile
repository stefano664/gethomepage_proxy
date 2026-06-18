FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cached until package.json changes)
COPY package.json ./
RUN npm ci

COPY . .

EXPOSE 3456

CMD ["node", "server.js"]
