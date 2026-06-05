# LFSRSoft — Tienda de Software y Licencias Digitales sobre Kubernetes

Proyecto final del curso DevOps con Kubernetes, Semestre 2026-2.

**De La Merced Soriano Uriel Benjamin — Ingenieria en Computacion — Equipo LFSR8**

---

## Que es este proyecto

LFSRSoft es una tienda de licencias de software profesional desplegada sobre un cluster Kubernetes de tres nodos. La tienda tiene un catalogo de 30 productos en 8 categorias, un carrito de compras y un generador de licencias cifradas con AES-256. Cada licencia que se genera es unica, usa un UUID v4 que se cifra con AES-256 GCM usando una clave almacenada en un Kubernetes Secret.

El proyecto integra cuatro semanas de contenido: infraestructura automatizada con Ansible, aplicacion de tres capas con seguridad zero-trust, observabilidad con Prometheus y Grafana, y CI/CD con Tekton y ArgoCD.

---

## Infraestructura del cluster

| Nodo | IP | RAM | Rol |
|---|---|---|---|
| master01-proyecto | 192.168.28.138 | 3 GB | Control Plane |
| worker01-proyecto | 192.168.28.139 | 2 GB | Worker |
| worker02-proyecto | 192.168.28.128 | 2 GB | Worker |

Sistema operativo: Rocky Linux 9.7
Kubernetes: 1.28.15
CNI: Flannel (red de pods 10.244.0.0/16)
Storage: NFS CSI Driver con StorageClass nfs-csi como predeterminada

---

## Estructura del repositorio

```
LFSRSoft/
├── README.md                        <- este archivo
├── .gitignore
├── argocd-application.yaml          <- Application de ArgoCD apuntando a proyecto-lfsrsoft/k8s
│
├── proyecto-lfsrsoft/               <- El proyecto final completo
│   ├── README.md
│   ├── backend/                     <- API REST en Go + Fiber
│   │   ├── README.md
│   │   ├── main.go
│   │   ├── go.mod
│   │   ├── go.sum
│   │   └── Containerfile
│   ├── frontend/                    <- Tienda web en Next.js 14
│   │   ├── README.md
│   │   ├── pages/
│   │   │   ├── index.js             <- Landing page
│   │   │   ├── catalogo.js          <- Catalogo con carrito y pedidos
│   │   │   └── nosotros.js          <- Informacion del proyecto
│   │   ├── public/
│   │   │   └── images/
│   │   │       ├── productos/       <- 30 imagenes de productos (400x400px)
│   │   │       ├── categorias/      <- 8 imagenes de categorias (800x400px)
│   │   │       └── ui/              <- banner.jpg y logo.png
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── Containerfile
│   └── k8s/                         <- Manifiestos de Kubernetes del proyecto
│       ├── README.md
│       ├── backend-deployment.yaml
│       ├── backend-service.yaml
│       ├── frontend-deployment.yaml
│       ├── frontend-service.yaml
│       ├── networkpolicy.yaml
│       └── rbac.yaml
│
└── k8s-labs/                        <- Laboratorios del curso (semanas 1 a 4)
    ├── README.md
    ├── 01-namespace/
    ├── 02-pod/
    ├── ...
    ├── monitoring/                  <- Stack de observabilidad
    │   ├── README.md
    │   └── *.yaml
    └── tekton-argocd/               <- Tasks y Pipeline de CI/CD
        ├── README.md
        └── *.yaml
```

---

## Accesos del sistema

| Servicio | URL | Credenciales |
|---|---|---|
| Tienda LFSRSoft | http://192.168.28.138:30080 | sin autenticacion |
| Catalogo | http://192.168.28.138:30080/catalogo | sin autenticacion |
| Nosotros | http://192.168.28.138:30080/nosotros | sin autenticacion |
| Backend API | http://192.168.28.138:30081 | sin autenticacion |
| Prometheus | http://192.168.28.139:30900 | sin autenticacion |
| Grafana | http://192.168.28.139:30300 | admin / bootcamp2026 |
| ArgoCD | https://192.168.28.139:30443 | admin / ver Secret |

---

## Imagenes en Docker Hub

```
docker.io/uriel0331dls/lfsr-backend:v5    <- version en produccion
docker.io/uriel0331dls/lfsr-frontend:v6   <- version en produccion
```

---

## Como levantar el sistema desde cero

**Requisito:** Tener las tres VMs con Rocky Linux 9.7 encendidas y Ansible instalado en el master.

```bash
# 1. Instalar el cluster (desde el master)
ansible-playbook -i ~/ansible-k8s/inventory/hosts.ini ~/ansible-k8s/playbooks/k8s-install.yml

# 2. Crear el namespace y los secrets
kubectl apply -f ~/lfsr-app/k8s/secret.yaml
kubectl create secret docker-registry docker-credentials \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=uriel0331dls \
  --docker-password=TOKEN \
  -n lfsrsoft

# 3. Desplegar la aplicacion
kubectl apply -f proyecto-lfsrsoft/k8s/

# 4. Desplegar el stack de monitoreo
kubectl apply -f k8s-labs/monitoring/

# 5. Instalar ArgoCD y apuntar al repo
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl apply -f argocd-application.yaml
```

---

## Stack tecnologico

**Infraestructura:** Kubernetes 1.28 · Rocky Linux 9.7 · Ansible · NFS CSI Driver · VMware Workstation

**Aplicacion:** Go 1.24 · Fiber v2 · Next.js 14 · PostgreSQL 15 · AES-256 GCM · UUID v4

**Observabilidad:** Prometheus · Grafana · Loki · Promtail · Node Exporter · Kube State Metrics

**CI/CD:** ArgoCD · GitHub · Docker Hub

---

## Semestre 2026-2 | Ingenieria en Computacion | Equipo LFSR8
