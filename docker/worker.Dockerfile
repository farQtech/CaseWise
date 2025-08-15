FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm ci --only=production --legacy-peer-deps

# Copy source code
COPY . .

# Create APP_DATA directory
RUN mkdir -p /app/APP_DATA/uploads

# Set environment variables
ENV NODE_ENV=production
ENV BACKEND_URL=http://localhost:8080

# Start the worker
CMD ["npm", "start"] 