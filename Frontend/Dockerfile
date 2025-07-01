# Use Node.js as the base image
FROM node:22-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json /app/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . /app/

# Expose port 3000 for the frontend
EXPOSE 3001

# Command to start the React development server
CMD ["npm", "start", "3001"]


