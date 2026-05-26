# Etapa 1: Instalación de dependencias y construcción
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Imagen final de producción
FROM node:24-alpine
WORKDIR /app

# Copiamos solo lo necesario para ejecutar
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Instalamos solo dependencias de producción
RUN npm install --only=production

EXPOSE 3000

CMD ["npm", "run", "start:prod"]