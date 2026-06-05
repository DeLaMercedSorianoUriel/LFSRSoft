# k8s

Manifiestos de Kubernetes del proyecto LFSRSoft. Esta carpeta es la que lee ArgoCD para sincronizar el estado del cluster con el repositorio de GitHub.

---

## Archivos y su funcion

| Archivo | Recurso | Descripcion |
|---|---|---|
| backend-deployment.yaml | Deployment | Backend Go con Init Container, RBAC y probes de salud |
| backend-service.yaml | Service NodePort | Expone el backend en el puerto 30081 |
| frontend-deployment.yaml | Deployment | Frontend Next.js con selector de nodo |
| frontend-service.yaml | Service NodePort | Expone el frontend en el puerto 30080 |
| networkpolicy.yaml | 7 NetworkPolicy | Seguridad zero-trust entre los pods |
| rbac.yaml | SA + Role + RoleBinding | Permisos minimos para el pod del backend |

---

## Como aplica ArgoCD estos manifiestos

ArgoCD monitorea esta carpeta en la rama Develop del repositorio. Cada vez que se hace un push con cambios en cualquier archivo de esta carpeta, ArgoCD detecta la diferencia entre el estado del repositorio y el estado del cluster y aplica los cambios automaticamente.

```
git push origin Develop  ->  ArgoCD sync  ->  kubectl apply -f k8s/
```

---

## NetworkPolicies implementadas

El namespace lfsrsoft usa el modelo zero-trust. Todo el trafico esta bloqueado por defecto y solo se permiten los canales especificamente declarados.

```
default-deny-all
    Bloquea todo el trafico entrante y saliente en el namespace

allow-frontend-ingress
    Permite trafico externo al frontend en el puerto 3000

allow-frontend-to-backend
    El frontend puede conectarse al backend en el puerto 8080

allow-backend-ingress
    El backend solo recibe trafico desde el frontend

allow-backend-to-postgres
    El backend puede conectarse a PostgreSQL en el puerto 5432

allow-postgres-from-backend-only
    PostgreSQL solo acepta conexiones del backend

allow-dns-egress
    Todos los pods pueden resolver DNS en el puerto 53
```

---

## RBAC del proyecto

```
ServiceAccount: licencia-generator-sa
    Identidad del pod del backend dentro del cluster

Role: licencia-reader-role
    Permisos de solo lectura sobre secrets, configmaps y pods

RoleBinding: licencia-generator-binding
    Asocia el Role al ServiceAccount
```

Se verifico el principio de minimo privilegio:

```bash
# Puede leer secrets (necesario para la clave AES):
kubectl auth can-i get secrets \
  --as=system:serviceaccount:lfsrsoft:licencia-generator-sa \
  -n lfsrsoft
# Respuesta: yes

# No puede borrar secrets:
kubectl auth can-i delete secrets \
  --as=system:serviceaccount:lfsrsoft:licencia-generator-sa \
  -n lfsrsoft
# Respuesta: no
```

---

## Para aplicar manualmente (sin ArgoCD)

```bash
# Prerequisito: el Secret db-secret debe existir
kubectl apply -f k8s/rbac.yaml
kubectl apply -f k8s/networkpolicy.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Verificar
kubectl get pods -n lfsrsoft
kubectl get svc -n lfsrsoft
```

---

## Nota sobre el Secret

El archivo `secret.yaml` esta en el .gitignore del repositorio porque contiene credenciales. Para recrearlo:

```bash
kubectl create secret generic db-secret \
  --from-literal=DB_USER=admin \
  --from-literal=DB_PASSWORD=proyectoDEV \
  --from-literal=DB_NAME=LFSR \
  --from-literal=AES_KEY=$(openssl rand -base64 32) \
  -n lfsrsoft
```
