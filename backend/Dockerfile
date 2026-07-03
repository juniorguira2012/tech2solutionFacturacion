FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install -g @nestjs/cli
COPY . .
RUN npm run build

# Etapa 2: Imagen final (Producción)
FROM node:20-alpine
WORKDIR /app

# 🚀 SOLUCIÓN: Instalamos el cliente de postgresql para que pg_dump esté disponible en producción
RUN apk add --no-cache postgresql-client

# Copiamos solo lo necesario para ejecutar
COPY --from=builder /app/package*.json ./
# Instalamos dependencias primero para cachear capas
RUN npm install --omit=dev
# Luego copiamos el build
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]