# 1. Use a stable Alpine Node image, uses Node 22 for a stable version
FROM node:22-alpine

# 2. Set the working directory to match your docker-compose volume
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the code
COPY . .

# 5. Expose the exact port Vite is configured to use
EXPOSE 3000

# 6. Run the active Vite development server
CMD ["npm", "run", "dev"]