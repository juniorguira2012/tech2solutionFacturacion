# Etapa 1: Construcción
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Instalamos dependencias y el CLI de NestJS para compilar
RUN npm install && npm install -g @nestjs/cli
COPY . .
RUN npm run build

# Etapa 2: Imagen final (Producción)
FROM node:22-alpine
WORKDIR /app

# 1. Declarar el ARG para recibir el valor desde docker-compose
ARG VITE_GOOGLE_CLIENT_ID
# 2. Convertirlo en ENV para que Vite lo lea durante 'npm run build'
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# 🚀 Aquí SÍ es correcto tener el cliente de Postgres para backups y scripts del backend
RUN apk add --no-cache postgresql18-client

# Copiamos solo lo necesario para ejecutar y ahorrar espacio
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

# Copiamos el build generado
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]