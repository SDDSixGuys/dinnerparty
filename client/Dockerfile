FROM node:20

WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY client/package*.json ./client/

RUN npm install

COPY . .

WORKDIR /app/client

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]