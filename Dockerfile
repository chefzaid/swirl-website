FROM node:24.19.0-alpine@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43 AS runtime-base
ENV NODE_ENV=production PORT=8080 DATA_DIR=/data PUBLIC_ORIGIN=https://swirlit.dev
WORKDIR /app
# Runtime dependencies, including the PostgreSQL driver, are bundled by Vite.
RUN apk upgrade --no-cache \
    && rm -rf /usr/local/lib/node_modules/npm /opt/yarn-* \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/yarn /usr/local/bin/yarnpkg \
    && mkdir -p /data /app/dist/client /app/dist/runtime \
    && chmod 0755 /app/dist /app/dist/client /app/dist/runtime \
    && chown node:node /data
COPY --chown=node:node package.json ./
COPY --chown=node:node db/migrations ./db/migrations
USER node
EXPOSE 8080
CMD ["node", "dist/runtime/main.js"]

# CI can package its already validated build with --target prebuilt.
FROM runtime-base AS prebuilt
COPY --chown=node:node dist/client ./dist/client
COPY --chown=node:node dist/runtime ./dist/runtime
# Check runtime readability and parseability as the container's unprivileged user.
RUN test -r ./dist/runtime/main.js && test -r ./dist/client/robots.txt \
    && node --check ./dist/runtime/main.js

FROM node:24.19.0-alpine@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM runtime-base AS runtime
COPY --from=build --chown=node:node /app/dist/client ./dist/client
COPY --from=build --chown=node:node /app/dist/runtime ./dist/runtime
RUN test -r ./dist/runtime/main.js && test -r ./dist/client/robots.txt \
    && node --check ./dist/runtime/main.js
