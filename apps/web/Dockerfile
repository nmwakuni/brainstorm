# ============================================================================
# Multi-stage Dockerfile for Salary Advance Web Dashboard (Next.js)
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
COPY apps/web/package.json ./apps/web/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# ============================================================================
# Stage 3: Builder
# ============================================================================
FROM dependencies AS builder

# Copy source code
COPY packages/types ./packages/types
COPY packages/lib ./packages/lib
COPY apps/web ./apps/web
COPY turbo.json ./

# Build shared packages first
RUN pnpm --filter @salary-advance/types build
RUN pnpm --filter @salary-advance/lib build

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build Next.js app
RUN pnpm --filter @salary-advance/web build

# ============================================================================
# Stage 4: Production Dependencies
# ============================================================================
FROM base AS prod-dependencies

# Copy package files
COPY packages/types/package.json ./packages/types/
COPY packages/lib/package.json ./packages/lib/
COPY apps/web/package.json ./apps/web/

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
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy production dependencies
COPY --from=prod-dependencies --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=prod-dependencies --chown=nextjs:nodejs /app/packages ./packages
COPY --from=prod-dependencies --chown=nextjs:nodejs /app/apps/web/node_modules ./apps/web/node_modules

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/packages/types/dist ./packages/types/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/lib/dist ./packages/lib/dist
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy package.json files for runtime
COPY --from=builder --chown=nextjs:nodejs /app/packages/types/package.json ./packages/types/
COPY --from=builder --chown=nextjs:nodejs /app/packages/lib/package.json ./packages/lib/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json ./apps/web/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/next.config.js ./apps/web/

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Set NODE_ENV
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start Next.js
CMD ["node_modules/.bin/next", "start", "-p", "3001"]
