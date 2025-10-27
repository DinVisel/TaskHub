# 1) Use an official Node runtime
FROM node:18

# 2) Set working directory inside the image
WORKDIR /app

# 3) Copy only package files first (better caching)
COPY package*.json ./

# 4) Install dependencies
RUN npm install --production=false

# 5) Copy the rest of your source code
COPY . .

# 6) Expose the port your server listens on 
EXPOSE 4000

# 7) Default command to run your app
CMD ["npm", "start"]
