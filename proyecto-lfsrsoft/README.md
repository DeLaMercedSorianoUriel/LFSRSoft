# proyecto-lfsrsoft

Aplicacion LFSRSoft completa: backend en Go, frontend en Next.js y manifiestos de Kubernetes.

Esta carpeta contiene el proyecto final del curso. ArgoCD lee los manifiestos de la subcarpeta `k8s/` y los sincroniza automaticamente al cluster cada vez que se hace un push a la rama Develop.

---

## Estructura

```
proyecto-lfsrsoft/
├── backend/         <- API REST en Go con Fiber
├── frontend/        <- Tienda web en Next.js 14
└── k8s/             <- Manifiestos de Kubernetes (gestionados por ArgoCD)
```

---

## Como esta organizado el flujo

```
Desarrollador hace git push a rama Develop
        |
        | ArgoCD detecta el cambio en k8s/
        v
Kubernetes actualiza los pods automaticamente
sin necesidad de kubectl apply manual
```

---

## Componentes desplegados en el namespace lfsrsoft

| Componente | Tipo | Puerto externo |
|---|---|---|
| lfsr-backend | Deployment + NodePort | 30081 |
| lfsr-frontend | Deployment + NodePort | 30080 |
| postgres-0 | StatefulSet + ClusterIP | interno |

---

## Variables de entorno del backend

Todas las variables sensibles vienen del Secret `db-secret` de Kubernetes. Nunca se escriben en el codigo ni en las imagenes Docker.

| Variable | Origen | Descripcion |
|---|---|---|
| DB_HOST | hardcoded (IP directa) | IP del ClusterIP de postgres-service |
| DB_PORT | hardcoded | 5432 |
| DB_USER | db-secret | Usuario de PostgreSQL |
| DB_PASSWORD | db-secret | Contrasena de PostgreSQL |
| DB_NAME | db-secret | Nombre de la base de datos |
| AES_KEY | db-secret | Clave maestra de cifrado AES-256 |

---

## Para subir un cambio a produccion

```bash
# Modificar el codigo en backend/ o frontend/
# Reconstruir la imagen
podman build --no-cache -t docker.io/uriel0331dls/lfsr-backend:v6 ./backend/
podman push docker.io/uriel0331dls/lfsr-backend:v6

# Actualizar el tag en k8s/backend-deployment.yaml
sed -i 's|lfsr-backend:v5|lfsr-backend:v6|g' k8s/backend-deployment.yaml

# Push — ArgoCD hace el resto
git add .
git commit -m "feat: backend v6"
git push origin Develop
```

ArgoCD detecta el cambio en `k8s/backend-deployment.yaml` y actualiza el Deployment en el cluster sin intervencion manual.
