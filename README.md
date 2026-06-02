# Proyecto LFSRSoft — Tienda de Software y Licencias Digitales

Proyecto final del curso DevOps con Kubernetes.

## Equipo LFSR8 — Semestre 2026-1

## Stack
- Frontend: Next.js (SSR)
- Backend: Go + Fiber (generador de licencias UUID cifradas AES-256)
- Base de datos: PostgreSQL en StatefulSet con PVC NFS
- Infraestructura: Kubernetes 1.28 en Rocky Linux 9.7
- CI/CD: Tekton + ArgoCD
- Observabilidad: Prometheus + Grafana + Loki + Tempo

## Maquinas
- master01-proyecto: 192.168.28.138
- worker01-proyecto: 192.168.28.139
- worker02-proyecto: 192.168.28.128

## Estructura
- k8s-labs/     → Labs practicos del curso
- proyecto-lfsrsoft/ → Proyecto final con backend, frontend y YAMLs K8s
