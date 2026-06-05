# backend

API REST del proyecto LFSRSoft desarrollada en Go 1.24 con el framework Fiber v2.

---

## Que hace el backend

El backend es el nucleo del proyecto. Se encarga de:

- Servir el catalogo de 30 productos de software desde PostgreSQL
- Gestionar el carrito de compras por sesion de usuario
- Procesar pedidos y generar las licencias cifradas
- Exponer metricas Prometheus en `/metrics` via fiberprometheus
- Registrar logs de auditoria de cada licencia generada

---

## Endpoints disponibles

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | /health | Verificacion de salud del servicio |
| GET | /licencias | Devuelve los 30 productos del catalogo |
| GET | /licencias/categoria/:cat | Productos filtrados por categoria |
| GET | /licencias/:id | Detalle de un producto |
| POST | /licencias/generar | Genera una licencia AES-256 (uso interno) |
| POST | /carrito/agregar | Agrega un producto al carrito de la sesion |
| GET | /carrito/:sesion | Obtiene el carrito de una sesion |
| DELETE | /carrito/:sesion/item/:id | Elimina un item del carrito |
| DELETE | /carrito/:sesion | Vacia el carrito completo |
| POST | /pedidos/checkout | Procesa el pedido y genera todas las licencias |
| GET | /pedidos/:sesion | Historial de pedidos de la sesion |
| GET | /metrics | Metricas Prometheus |

---

## Como funciona el generador de licencias AES-256

```
POST /pedidos/checkout
        |
        | Para cada producto en el carrito:
        v
1. Genera UUID v4 unico (ej: f47ac10b-58cc-4372-a567-0e02b2c3d479)
2. Lee AES_KEY del Kubernetes Secret (nunca del codigo)
3. Cifra el UUID con AES-256 GCM
4. Forma la clave visible: LFSR-F47A-C10B-58CC-4372
5. Guarda en PostgreSQL: clave visible + version cifrada + timestamp
6. Responde con las claves al frontend
```

La clave visible tiene el formato `LFSR-XXXX-XXXX-XXXX-XXXX` donde los grupos son los primeros 16 caracteres del UUID.

---

## Dependencias

```
github.com/gofiber/fiber/v2          <- Framework HTTP
github.com/lib/pq                    <- Driver PostgreSQL
github.com/google/uuid               <- Generacion de UUID v4
github.com/ansrivas/fiberprometheus  <- Metricas Prometheus
```

---

## Como compilar localmente

```bash
cd backend/
go mod download
go build -o lfsr-backend .
./lfsr-backend
```

Requiere las variables de entorno: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `AES_KEY`.

---

## Como construir y publicar la imagen

```bash
podman login docker.io -u uriel0331dls -p TOKEN

podman build --no-cache -t docker.io/uriel0331dls/lfsr-backend:v5 .
podman push docker.io/uriel0331dls/lfsr-backend:v5
```

La imagen usa multi-stage build: la etapa de compilacion usa `golang:1.22-alpine` y la imagen final usa `alpine:3.19`, quedando en aproximadamente 20 MB.

---

## Estructura del Containerfile

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY main.go .
RUN CGO_ENABLED=0 GOOS=linux go build -o lfsr-backend .

FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/lfsr-backend .
EXPOSE 8080
CMD ["./lfsr-backend"]
```

---

## Imagenes publicadas en Docker Hub

```
docker.io/uriel0331dls/lfsr-backend:v1  <- primera version con endpoints basicos
docker.io/uriel0331dls/lfsr-backend:v2  <- carrito y pedidos
docker.io/uriel0331dls/lfsr-backend:v3  <- precio en MXN
docker.io/uriel0331dls/lfsr-backend:v4  <- descuento de stock al comprar
docker.io/uriel0331dls/lfsr-backend:v5  <- metricas Prometheus (version en produccion)
```
