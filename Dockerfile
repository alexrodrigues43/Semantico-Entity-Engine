# Dockerfile otimizado para Google Cloud Run (Node.js 20 + Express + Vite)
# Multi-stage build para manter a imagem enxuta, veloz e segura

# -------------------------------------------------------------
# Estágio 1: Builder (Compilação do Frontend Vite e do Backend)
# -------------------------------------------------------------
FROM node:20-slim AS builder

WORKDIR /app

# Copiar manifests de dependências
COPY package*.json ./

# Instalar todas as dependências necessárias para compilação
RUN npm ci

# Copiar código-fonte da aplicação
COPY . .

# Executar build de produção:
# 1. vite build (gera os bundles do SPA em dist/)
# 2. esbuild server.ts (empacota o servidor Node.js em dist/server.cjs)
RUN npm run build

# -------------------------------------------------------------
# Estágio 2: Runner (Imagem final de produção enxuta)
# -------------------------------------------------------------
FROM node:20-slim AS runner

# Variáveis de ambiente padrão para Cloud Run
ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

# Copiar apenas os manifests de dependências
COPY package*.json ./

# Instalar estritamente as dependências de produção (sem devDependencies)
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copiar artefatos compilados do estágio builder
COPY --from=builder /app/dist ./dist
COPY firebase-applet-config.json ./firebase-applet-config.json

# Expor a porta padrão do Cloud Run
EXPOSE 8080

# Iniciar servidor Node.js apontando para o bundle CJS de produção
CMD ["node", "dist/server.cjs"]
