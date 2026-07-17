# syntax=docker/dockerfile:1

# Multi-stage build producing a small, non-root image that serves the Next.js
# production server from its `standalone` output. See docs/operations/deployment.md.

# ---- Base -------------------------------------------------------------------
# Pin to the Node 22 line (matches .nvmrc and package.json "engines"); pnpm
# 11.9 requires Node >=22.13.
FROM node:22-alpine AS base
# libc compatibility for Next.js / sharp native binaries on Alpine (musl).
RUN apk add --no-cache libc6-compat
# Enable pnpm through Corepack using the version pinned in package.json.
RUN corepack enable
WORKDIR /app

# ---- Dependencies -----------------------------------------------------------
# Isolated so this layer is cached until the manifests actually change.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ---- Builder ----------------------------------------------------------------
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* values are inlined into the build output at build time, so they
# must be present here (not just at runtime). The deploy workflow passes them as
# build args; the site URL defaults to the dev subdomain.
ARG NEXT_PUBLIC_SITE_URL=https://portfolio.yannikwuenker.de
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# Cookieless Umami analytics (S2-5). Both are public and default empty, so the
# tracking tag is omitted unless a build supplies them. See
# docs/operations/analytics.md.
ARG NEXT_PUBLIC_ANALYTICS_SRC=
ENV NEXT_PUBLIC_ANALYTICS_SRC=$NEXT_PUBLIC_ANALYTICS_SRC
ARG NEXT_PUBLIC_ANALYTICS_WEBSITE_ID=
ENV NEXT_PUBLIC_ANALYTICS_WEBSITE_ID=$NEXT_PUBLIC_ANALYTICS_WEBSITE_ID
# Self-hosted GlitchTip error tracking (S6-2). Public DSN, default empty, so the
# Sentry SDK stays inert unless a build supplies it. See
# docs/operations/error-monitoring.md.
ARG NEXT_PUBLIC_SENTRY_DSN=
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---- Runner -----------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as an unprivileged user rather than root.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# The standalone bundle carries its own traced node_modules and server.js;
# static assets and public files are copied alongside it.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
