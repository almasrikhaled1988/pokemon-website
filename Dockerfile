FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev deps for building)
RUN npm install

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Expose the API port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
