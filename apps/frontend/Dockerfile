FROM node:18-alpine

WORKDIR /app

# Add package files
COPY package.json package-lock.json* ./

# Install dependencies with legacy-peer-deps flag
RUN npm install --legacy-peer-deps

# Add rest of the client code
COPY . .

EXPOSE 3000

ENV NODE_ENV=development

# Start development server
CMD ["npm", "start"] 