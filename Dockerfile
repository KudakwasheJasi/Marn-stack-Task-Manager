FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy config file
COPY config.js .

# Copy server code
COPY . .

EXPOSE 8800

# Set environment variables from config
ENV MONGODB_URI=${mongodbUri}
ENV JWT_SECRET=${jwtSecret}
ENV CLIENT_URL=${clientUrl}
ENV PORT=${port}
ENV NODE_ENV=${nodeEnv}

CMD ["npm", "start"]
