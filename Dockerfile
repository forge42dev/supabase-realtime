# syntax = docker/dockerfile:1.4

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.11.0
FROM node:${NODE_VERSION}-slim AS base

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
ARG PNPM_VERSION=9.14.4
RUN npm install -g pnpm@$PNPM_VERSION

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y ca-certificates openssl

# Install node modules
COPY .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY . .

RUN pnpm prisma generate

# Build application
RUN pnpm run build

# Remove development dependencies
RUN pnpm prune --prod

# Copy built application
COPY /app /app

ENV PORT="8080"
EXPOSE $PORT

# Start the server by default, this can be overwritten at runtime
CMD [ "pnpm", "run", "start" ]
