# Use the latest official Node.js image from the Docker Hub
FROM node:22-alpine3.19

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files into the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the application code into the container
COPY . .

# Expose port 2000 for the Express app
EXPOSE 2000

# Command to run the Express app
CMD ["npm", "start"]
