# Build the Vite frontend and bundle the TypeScript server.
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build \
    && ./node_modules/.bin/esbuild server.ts --bundle --platform=node --format=esm --packages=external --outfile=server.mjs \
    && npm prune --omit=dev --no-audit

# Run with only production dependencies and built assets.
FROM node:24-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app \
    && mkdir -p /app/.data \
    && chown -R app:app /app/.data
COPY --from=build --chown=app:app /app/package.json ./package.json
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist
COPY --from=build --chown=app:app /app/server.mjs ./server.mjs

USER app
EXPOSE 3000
CMD ["node", "server.mjs"]
