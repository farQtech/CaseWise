FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies with legacy peer deps
RUN npm ci --only=production --legacy-peer-deps

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Create APP_DATA directory
RUN mkdir -p /app/APP_DATA/uploads

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start the application
CMD ["npm", "start"] 