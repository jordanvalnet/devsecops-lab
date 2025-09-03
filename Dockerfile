# --- Builder: install prod deps de façon déterministe ---
FROM node:22-alpine AS builder
WORKDIR /app

# Copie uniquement les manifests pour tirer parti du cache
COPY package*.json ./
# Installe uniquement les deps prod (pas de dev)
RUN npm ci --omit=dev

# Copie le code
COPY . .

# Par sécurité, s'assure qu'il n'y a que les deps prod
RUN npm prune --omit=dev

# --- Runtime: image propre, sans lockfile ni devDeps ---
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copie juste ce qui sert à exécuter
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src ./src

USER node
EXPOSE 3000
CMD ["node", "src/index.js"]
