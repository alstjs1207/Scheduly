# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Add package files
COPY package.json package-lock.json* ./

# Install dependencies with specific TypeScript version
RUN npm cache clean --force && \
    npm install --legacy-peer-deps && \
    npm install typescript@4.9.5 --save-dev && \
    npm install ajv@latest

# Add rest of the client code
COPY . .

ENV NODE_ENV=production

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 