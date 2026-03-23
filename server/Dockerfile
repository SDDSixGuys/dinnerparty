FROM node:20

WORKDIR /app

# Copy root workspace files first
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies (workspace-aware)
RUN npm install

# Copy source
COPY . .

WORKDIR /app/server

EXPOSE 8080

CMD ["npm", "run", "dev"]