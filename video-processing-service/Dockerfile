# Ue an official Node runtime as a parent image
FROM node:18


# Set the working directory in the container to /app
WORKDIR /app

COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install 

# Install ffmpeg in the container
RUN apt-get update && apt-get install -y ffmpeg

# Copy app source inside the docker image
COPY . .

# Make Port 3000 available outside this container
EXPOSE 3000

# Define the command to run your  app using CMD (only one CMD allowed)
CMD [ "npm", "start" ]