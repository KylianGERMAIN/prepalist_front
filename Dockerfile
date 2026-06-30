# syntax=docker/dockerfile:1
# Image de prod du front PrepaList — Next 16 standalone, pnpm via corepack.

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# API_URL est un besoin RUNTIME (pas build) : injecté au `docker run`, pas ici.
RUN pnpm build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
USER node
# API_URL doit être fournie au lancement : docker run -e API_URL=https://api.example.com ...
CMD ["node", "server.js"]
