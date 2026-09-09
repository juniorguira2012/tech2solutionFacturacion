# Etapa 1: Construcción
FROM node:20-alpine AS build
WORKDIR /app

# Argumento para la URL de la API
ARG VITE_API_URL=https://inventario.oneredrd.com/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servidor de producción (Nginx)
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]