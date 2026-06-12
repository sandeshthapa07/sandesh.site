# syntax=docker/dockerfile:1
# Multi-stage build for the Next.js app in this Turborepo monorepo.
#   docker build -t portfolio .
#   docker run -p 3000:3000 portfolio

FROM node:22-alpine AS base
RUN corepack enable pnpm

# ---- Prune the monorepo to just what `web` needs ----
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo@2
COPY . .
RUN turbo prune web --docker

# ---- Install dependencies and build ----
FROM base AS builder
WORKDIR /app

# Install from lockfile-only context first so this layer caches well.
COPY --from=pruner /app/out/json/ .
# Skip lifecycle scripts: lefthook's git-hook install has no .git here.
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY --from=pruner /app/out/full/ .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time.
ARG NEXT_PUBLIC_SITE_URL=https://sandesh.site
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN pnpm turbo build --filter=web

# ---- Minimal runtime image ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
