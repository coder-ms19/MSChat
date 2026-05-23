# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

# Add necessary libraries for Prisma on Alpine
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Configure npm for stability, retries, and longer timeouts
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000

# Install build dependencies
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies for building
# We skip the Prisma postinstall here to avoid network issues during npm ci
# and handle the generation/engine download in a separate dedicated step.
RUN PRISMA_SKIP_POSTINSTALL_GENERATE=1 npm ci

# Copy source code
COPY . .

# Generate Prisma Client (this will download engines if needed)
# Adding a dummy DATABASE_URL as Prisma requires it for generation even if not used
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate || (sleep 5 && npx prisma generate)

# Build the application
RUN npm run build

# Stage 2: Production Dependencies (only node_modules)
FROM node:20-alpine AS dependencies
# Add necessary libraries for Prisma on Alpine
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/

# Configure npm for stability
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000

# Install only production dependencies
RUN PRISMA_SKIP_POSTINSTALL_GENERATE=1 npm install --omit=dev --no-audit && npm cache clean --force
ENV DATABASE_URL="postgresql://postgres:9165@localhost:5432/SocialMediaDbNEW?schema=public"
RUN npx prisma generate || (sleep 5 && npx prisma generate)



# Stage 3: Final Production Image
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling in K8s
RUN apk add --no-cache dumb-init

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Copy essential files only
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Set permissions
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle SIGTERM/SIGINT from Kubernetes pods correctly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the application
CMD ["node", "dist/src/main.js"]

