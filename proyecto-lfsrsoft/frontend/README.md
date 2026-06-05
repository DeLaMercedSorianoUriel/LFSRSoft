# frontend

Tienda web de LFSRSoft desarrollada en Next.js 14 con React 18.

---

## Que hace el frontend

El frontend es la interfaz de usuario de la tienda. Tiene tres paginas:

**index.js** — Landing page con el hero principal, las ocho categorias de software con sus imagenes y una seleccion de productos destacados con sus precios en MXN. Incluye los pasos de como funciona la compra y los badges del stack tecnologico del proyecto.

**catalogo.js** — Catalogo completo con los 30 productos. Tiene filtro por categoria en la barra superior, buscador por nombre o desarrollador, carrito lateral deslizable y panel de historial de pedidos. Al hacer checkout muestra las claves generadas en formato LFSR-XXXX-XXXX-XXXX-XXXX.

**nosotros.js** — Pagina informativa con la mision y vision del proyecto, el stack tecnologico completo, como funciona el generador de licencias paso a paso, el integrante del equipo y la arquitectura del cluster.

---

## Estructura de archivos

```
frontend/
├── pages/
│   ├── index.js         <- Landing page
│   ├── catalogo.js      <- Catalogo completo con carrito
│   ├── nosotros.js      <- Informacion del proyecto
│   └── api/
│       └── hello.js
├── public/
│   ├── favicon.ico
│   └── images/
│       ├── productos/   <- 30 imagenes JPG (400x400px), nombradas 1.jpg a 30.jpg
│       ├── categorias/  <- so.jpg, diseno.jpg, devops.jpg, videojuegos.jpg,
│       │                   datos.jpg, nube.jpg, seguridad.jpg, ofimatica.jpg
│       └── ui/          <- banner.jpg (1920x600px), logo.png (200x60px)
├── next.config.js
├── package.json
├── .dockerignore
└── Containerfile
```

---

## Variable de entorno requerida

```
NEXT_PUBLIC_BACKEND_URL=http://192.168.28.138:30081
```

Se configura en `next.config.js` y en el Deployment de Kubernetes.

---

## Como construir y publicar la imagen

```bash
# Las imagenes de productos deben estar en public/images/ antes del build
podman build --no-cache -t docker.io/uriel0331dls/lfsr-frontend:v6 .
podman push docker.io/uriel0331dls/lfsr-frontend:v6
```

Las imagenes de productos, categorias, banner y logo se incluyen directamente en la imagen Docker durante el paso `COPY . .` de la etapa de build. No se sirven desde un CDN externo.

---

## Como correr en desarrollo local

```bash
npm install
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080 npm run dev
```

Abrir http://localhost:3000

---

## Imagenes publicadas en Docker Hub

```
docker.io/uriel0331dls/lfsr-frontend:v1  <- primera version
docker.io/uriel0331dls/lfsr-frontend:v2  <- con carrito
docker.io/uriel0331dls/lfsr-frontend:v3  <- con pedidos y claves
docker.io/uriel0331dls/lfsr-frontend:v4  <- con precios en MXN
docker.io/uriel0331dls/lfsr-frontend:v5  <- con imagenes incluidas (estructura incorrecta)
docker.io/uriel0331dls/lfsr-frontend:v6  <- con imagenes correctas + 3 paginas (version en produccion)
```

---

## Containerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```
