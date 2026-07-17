# Etapa 1: Construcción
FROM node:20-alpine AS build
WORKDIR /app

#RUN apk add --no-cache postgresql-client 
RUN apk add --no-cache postgresql-client

# Argumento para la URL de la API (necesario en build time para Vite)
ARG VITE_API_URL=https://inventario.oneredrd.com/api

ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN VITE_API_URL=$VITE_API_URL npm run build

# Etapa 2: Servidor de producción (Nginx)
FROM nginx:stable-alpine

# Copiamos la configuración de Nginx para soportar rutas de React (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos generados por Vite al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]