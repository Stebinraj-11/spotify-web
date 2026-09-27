FROM node:20-bookworm-slim

# Install system dependencies required for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root and client package definitions
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN npm --prefix client install

# Copy application source code
COPY . .

# Build the client production bundle
RUN npm --prefix client run build

# Default environment settings
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0
ENV DATA_DIR=/app/data

# Persistent storage volume for SQLite DB, covers, and music library
VOLUME ["/app/data"]

EXPOSE 5000

CMD ["node", "server/index.js"]
