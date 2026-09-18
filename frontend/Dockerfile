FROM node:20-alpine AS build
WORKDIR /app

# Variables públicas que Vite debe recibir durante la compilación.
ARG VITE_API_URL=https://inventario.oneredrd.com/api
ARG VITE_GOOGLE_CLIENT_ID=874032250165-2ghib55116sp86fsicpsds99uvmja33i.apps.googleusercontent.com

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

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