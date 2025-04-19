# Stage 1: Build
FROM node:slim AS builder
WORKDIR /app

# Install build dependencies (if needed for native modules)
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies with clean cache
COPY package*.json ./
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy and build
COPY . .
RUN npm run register

# Stage 2: Run
FROM node:slim
WORKDIR /app

# Create non-root user with explicit UID/GID
RUN groupadd -r appuser -g 1001 && \
    useradd -r -u 1001 -g appuser appuser && \
    mkdir -p /app/data && \
    chown -R appuser:appuser /app/data

# Copy from builder as non-root
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /app ./

# Security hardening
RUN find /app -type d -exec chmod 755 {} + && \
    find /app -type f -exec chmod 644 {} + && \
    chmod 755 /app/data

USER appuser
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/app.js"]