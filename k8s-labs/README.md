# k8s-labs

Laboratorios practicos del curso DevOps con Kubernetes, Semestre 2026-2.

Cada subcarpeta corresponde a un tema del curso. Los archivos son los YAMLs usados en clase y en los ejercicios integradores de cada semana.

---

## Estructura

```
k8s-labs/
├── 01-namespace/
├── 02-pod/
├── 03-configmap/
├── 04-secret/
├── 05-serviceaccount/
├── 06-deployment/
├── 07-service/
├── 08-pv-pvc/
├── 09-storageclass/
├── 10-statefulset/
├── 11-daemonset/
├── 12-networkpolicy/
├── 13-ejercicio-integrador/
├── 14-ejercicio-integrador-2/
├── monitoring/              <- Stack de observabilidad (Semana 3)
└── tekton-argocd/           <- CI/CD GitOps (Semana 4)
```

---

## Semanas del curso

**Semana 1** — Infraestructura: cluster con Ansible, namespaces, pods, configmaps, secrets, RBAC, deployments, services, PVs, PVCs, StorageClass, StatefulSets y DaemonSets.

**Semana 2** — Aplicacion de tres capas con seguridad: NetworkPolicy zero-trust, Init Containers, variables desde Secrets, imagenes con Podman y Docker Hub.

**Semana 3** — Observabilidad: Node Exporter, Kube State Metrics, Prometheus, Grafana, Loki, Promtail. Dashboards Node Exporter Full (ID 1860) y Kubernetes Cluster Monitoring (ID 315).

**Semana 4** — CI/CD GitOps: Tekton Pipelines con Tasks git-clone y build-push con Kaniko, ArgoCD con sincronizacion automatica desde GitHub.

---

## Como usar estos archivos

```bash
# Clonar el repositorio
git clone https://github.com/DeLaMercedSorianoUriel/LFSRSoft.git
cd LFSRSoft/k8s-labs

# Aplicar un laboratorio especifico
kubectl apply -f 01-namespace/namespace.yaml

# Verificar
kubectl get namespace
```

Cada subcarpeta tiene sus propios YAMLs listos para aplicar. Los YAMLs de monitoring y tekton-argocd requieren que el cluster este completamente configurado con NFS CSI Driver.
