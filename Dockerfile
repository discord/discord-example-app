# Stage 1: Build
FROM node:slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# register discord commands
RUN npm run register

# Stage 2: Run
FROM node:slim
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# For SQLite (ensure write permissions)
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node
COPY --chown=node:node . .

CMD ["node", "app.js"]