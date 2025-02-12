# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json bun.lockb ./

# Install Bun
RUN npm install -g bun

# Install dependencies using Bun
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the Angular application
RUN npm run build --prod

# Exit the container when done
CMD ["echo", "Build complete."]