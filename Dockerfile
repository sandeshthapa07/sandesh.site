# syntax=docker/dockerfile:1
# Multi-stage build for a Next.js app in this Turborepo monorepo.
#   docker build -t portfolio .                      (web, default)
#   docker build --build-arg APP=admin -t admin .    (admin panel)
#   docker run -p 3000:3000 portfolio

FROM node:22-alpine AS base
RUN corepack enable pnpm

# Which workspace app to build: web | admin
ARG APP=web

# ---- Prune the monorepo to just what the app needs ----
FROM base AS pruner
ARG APP
WORKDIR /app
RUN npm install -g turbo@2
COPY . .
RUN turbo prune "$APP" --docker

# ---- Install dependencies and build ----
FROM base AS builder
ARG APP
WORKDIR /app

# Install from lockfile-only context first so this layer caches well.
COPY --from=pruner /app/out/json/ .
# Skip lifecycle scripts: lefthook's git-hook install has no .git here.
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY --from=pruner /app/out/full/ .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time.
ARG NEXT_PUBLIC_SITE_URL=https://sandesh.site
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN pnpm turbo build --filter="$APP"

# ---- Minimal runtime image ----
FROM node:22-alpine AS runner
ARG APP
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV APP=$APP

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/public ./apps/${APP}/public

EXPOSE 3000
CMD ["sh", "-c", "node apps/$APP/server.js"]
