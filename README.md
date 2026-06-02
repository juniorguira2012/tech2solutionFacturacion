# Tech2Solution - Sistema de Facturación e Inventario 🚀

Tech2Solution es una plataforma integral para la gestión de inventario, facturación y auditorías físicas de almacenes. Este repositorio contiene la arquitectura de microservicios e infraestructura diseñada para correr de manera eficiente y escalable sobre **Docker Swarm** y administrada mediante **Portainer**.

## 🏗️ Arquitectura del Proyecto

El sistema está completamente contenedorizado y dividido en dos entornos independientes para garantizar la estabilidad en producción:

* **Producción:** Apunta al tag `latest` de las imágenes y expone los servicios principales de cara al cliente.
* **Laboratorio (Test):** Un entorno espejo aislado que utiliza el puerto alterno `5435` y el dominio público para pruebas masivas y queries de auditoría sin riesgo.

---

## 🛠️ Stack Tecnológico

* **Backend:** NestJS, TypeScript, TypeORM / Prisma.
* **Frontend:** React, Vite, Tailwind CSS.
* **Base de Datos:** PostgreSQL 15 (Alpine Linux).
* **Orquestación:** Docker Swarm & Portainer.
* **Redes y Enrutamiento:** Traefik / Reglas de Firewall (UFW).

---

## 📦 Repositorios en Docker Hub

Las imágenes oficiales del proyecto se versionan y distribuyen de manera pública a través de Docker Hub bajo los siguientes namespaces:

* **Backend:** `juniordone/tech2-backend`
* **Frontend:** `juniordone/tech2-frontend`

### Estrategia de Tags (Versionamiento)
* `test`: Última imagen compilada con los cambios en desarrollo para pruebas en el laboratorio.
* `vX` (ej. `v1`, `v2`): Versiones estables e históricas congeladas.
* `latest`: Imagen aprobada que corre actualmente en el entorno de producción.

---

## 🔄 Flujo de Despliegue y Promoción (CI/CD Manual)

Para pasar cambios del entorno de Test a Producción de manera segura sin caídas de servicio (*Zero Downtime*), seguimos el flujo de **Promoción de Imágenes**:

1. **Probar en Test:** Los cambios se suben al tag `:test` y se validan con el backup de producción en el puerto `5435`.
2. **Congelar Versión:** Se descarga la imagen aprobada y se le asigna un tag único de versión:
   ```bash
   docker pull juniordone/tech2-backend:test
   docker tag juniordone/tech2-backend:test juniordone/tech2-backend:v3
   docker push juniordone/tech2-backend:v3
