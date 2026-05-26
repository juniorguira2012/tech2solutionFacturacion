# Etapa 1: Construcción
FROM node:24-alpine AS build
WORKDIR /app

# Argumento para la URL de la API (necesario en build time para Vite)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor de producción (Nginx)
FROM nginx:stable-alpine

# Copiamos los archivos generados por Vite al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]