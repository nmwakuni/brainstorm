# ============================================================================
# Multi-stage Dockerfile for Salary Advance API
# ============================================================================

# Stage 1: Base
# ============================================================================
FROM node:18-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc* ./

# ============================================================================
# Stage 2: Dependencies
# ============================================================================
FROM base AS dependencies

# Copy all package.json files
COPY packages/types/package.json ./packages/types/
COPY packages/lib/package.json ./packages/lib/
COPY packages/database/package.json ./packages/database/
COPY apps/api/package.json ./apps/api/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# ============================================================================
# Stage 3: Builder
# ============================================================================
FROM dependencies AS builder

# Copy source code
COPY packages/types ./packages/types
COPY packages/lib ./packages/lib
COPY packages/database ./packages/database
COPY apps/api ./apps/api
COPY turbo.json ./

# Build shared packages first
RUN pnpm --filter @salary-advance/types build
RUN pnpm --filter @salary-advance/lib build
RUN pnpm --filter @salary-advance/database build

# Build API
RUN pnpm --filter @salary-advance/api build

# ============================================================================
# Stage 4: Production Dependencies
# ============================================================================
FROM base AS prod-dependencies

# Copy package files
COPY packages/types/package.json ./packages/types/
COPY packages/lib/package.json ./packages/lib/
COPY packages/database/package.json ./packages/database/
COPY apps/api/package.json ./apps/api/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# ============================================================================
# Stage 5: Runner (Final Production Image)
# ============================================================================
FROM node:18-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

WORKDIR /app

# Copy production dependencies
COPY --from=prod-dependencies --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=prod-dependencies --chown=hono:nodejs /app/packages ./packages
COPY --from=prod-dependencies --chown=hono:nodejs /app/apps/api/node_modules ./apps/api/node_modules

# Copy built application
COPY --from=builder --chown=hono:nodejs /app/packages/types/dist ./packages/types/dist
COPY --from=builder --chown=hono:nodejs /app/packages/lib/dist ./packages/lib/dist
COPY --from=builder --chown=hono:nodejs /app/packages/database/dist ./packages/database/dist
COPY --from=builder --chown=hono:nodejs /app/apps/api/dist ./apps/api/dist

# Copy package.json files for runtime
COPY --from=builder --chown=hono:nodejs /app/packages/types/package.json ./packages/types/
COPY --from=builder --chown=hono:nodejs /app/packages/lib/package.json ./packages/lib/
COPY --from=builder --chown=hono:nodejs /app/packages/database/package.json ./packages/database/
COPY --from=builder --chown=hono:nodejs /app/apps/api/package.json ./apps/api/

# Switch to non-root user
USER hono

# Expose port
EXPOSE 3000

# Set NODE_ENV
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "apps/api/dist/index.js"]
