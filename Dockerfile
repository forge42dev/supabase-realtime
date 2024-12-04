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


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3 git jq openssl

# Install node modules
COPY .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY . .

# Build application
RUN pnpm run build

RUN pnpm prisma generate

# Remove development dependencies
RUN pnpm prune --prod

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

ENV PORT="8080"
EXPOSE $PORT

# Start the server by default, this can be overwritten at runtime
CMD [ "pnpm", "run", "start" ]
