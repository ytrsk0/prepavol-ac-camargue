FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy source
COPY . .

# Build Vite frontend and Express backend
RUN npm run build

# Production image
FROM node:24-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built assets
COPY --from=builder /app/dist ./dist

EXPOSE 3000
ENV NODE_ENV=production

# Start the backend server
CMD ["npm", "start"]
