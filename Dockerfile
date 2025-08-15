# Multi-stage build for the entire application
FROM node:18-alpine AS base

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Install root dependencies
RUN npm install

# Copy workspace configurations
COPY backend/package*.json ./backend/
COPY worker/package*.json ./worker/
COPY frontend/package*.json ./frontend/

# Install all dependencies
RUN npm install

# Build stage
FROM base AS builder

# Copy source code
COPY . .

# Build all packages
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built applications
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/worker/src ./worker/src
COPY --from=builder /app/worker/package*.json ./worker/
COPY --from=builder /app/frontend/build ./frontend/build

# Install production dependencies for backend
WORKDIR /app/backend
RUN npm ci --only=production

# Install production dependencies for worker
WORKDIR /app/worker
RUN npm ci --only=production

# Create APP_DATA directory
RUN mkdir -p /app/APP_DATA/uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Copy start script
COPY --from=builder /app/package.json /app/
COPY --from=builder /app/node_modules /app/node_modules

# Expose port
EXPOSE 8080

# Start the backend (Railway will handle health checks)
WORKDIR /app/backend
CMD ["npm", "start"] 