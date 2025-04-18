# Stage 1: Build
FROM node:slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build # If you have a build step

# Stage 2: Run
FROM node:slim
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# For SQLite (ensure write permissions)
RUN mkdir -p /app/data && chown node:node /app/data
USER node

CMD ["node", "app.js"] # Replace with your entry file