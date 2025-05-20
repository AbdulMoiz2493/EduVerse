# Use Node.js 20 as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for both frontend and backend
COPY app/server/package*.json ./server/
COPY app/client/package*.json ./client/

# Install dependencies for backend
RUN cd server && npm install

# Install dependencies for frontend
RUN cd client && npm install

# Copy the rest of the application code
COPY app/server ./server/
COPY app/client ./client/

# Install concurrently to run both frontend and backend
RUN npm install -g concurrently

# Expose ports for backend (5000) and frontend (5173)
EXPOSE 5000 5173

# Run both backend and frontend
CMD ["concurrently", "--kill-others", "cd server && node server.js", "cd client && npm run dev -- --host 0.0.0.0"]
