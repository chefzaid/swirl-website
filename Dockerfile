FROM node:24.15.0-bookworm-slim@sha256:4e6b70dd6cbfc88c8157ba19aa3d9f9cce6ba4703576d55459e45efcbc9c5f5d AS runtime-base
ENV NODE_ENV=production PORT=8080 DATA_DIR=/data PUBLIC_ORIGIN=https://swirlit.dev
WORKDIR /app
RUN mkdir -p /data /app/dist/client /app/dist/server \
    && chmod 0755 /app/dist /app/dist/client /app/dist/server \
    && chown node:node /data
COPY --chown=node:node package.json ./
COPY --chown=node:node runtime ./runtime
COPY --chown=node:node server/security.ts ./server/security.ts
COPY --chown=node:node drizzle ./drizzle
USER node
EXPOSE 8080
CMD ["node", "runtime/main.ts"]

# CI can package its already validated build with --target prebuilt.
FROM runtime-base AS prebuilt
COPY --chown=node:node dist/client ./dist/client
COPY --chown=node:node dist/server/index.js ./dist/server/index.js
# Inherited USER node must be able to load the actual packaged Worker.
RUN test -r ./dist/server/index.js && test -r ./dist/client/robots.txt \
    && node --input-type=module -e "await import('./dist/server/index.js')"

FROM node:24.15.0-bookworm-slim@sha256:4e6b70dd6cbfc88c8157ba19aa3d9f9cce6ba4703576d55459e45efcbc9c5f5d AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM runtime-base AS runtime
COPY --from=build --chown=node:node /app/dist/client ./dist/client
COPY --from=build --chown=node:node /app/dist/server/index.js ./dist/server/index.js
RUN test -r ./dist/server/index.js && test -r ./dist/client/robots.txt \
    && node --input-type=module -e "await import('./dist/server/index.js')"
