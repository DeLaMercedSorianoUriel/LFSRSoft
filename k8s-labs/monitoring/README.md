# monitoring

Manifiestos del stack de observabilidad desplegado en el namespace `monitoring`.

---

## Componentes del stack

| Componente | Tipo | Puerto externo | PVC |
|---|---|---|---|
| node-exporter | DaemonSet (3 nodos) | 9100 en cada nodo | no |
| kube-state-metrics | Deployment + ClusterIP | 8080 interno | no |
| prometheus | Deployment + NodePort | 30900 | 5 Gi en NFS |
| grafana | Deployment + NodePort | 30300 | 1 Gi en NFS |
| loki | Deployment + ClusterIP | 3100 interno | 2 Gi en NFS |
| promtail | DaemonSet (3 nodos) | 9080 interno | no |

---

## Targets de Prometheus en estado UP

```
prometheus         1/1   localhost:9090
node-exporter      3/3   192.168.28.138:9100, 192.168.28.139:9100, 192.168.28.128:9100
kube-state-metrics 1/1   10.104.53.216:8080 (IP directa, DNS entre namespaces no resuelve)
kubernetes-apiservers 1/1  192.168.28.138:6443
kubernetes-nodes   3/3   via API Server proxy
kubernetes-cadvisor 3/3  via API Server proxy
lfsrsoft-backend   1/1   10.97.225.25:8080 (IP directa, fiberprometheus)
```

Los targets de kube-state-metrics y lfsrsoft-backend usan IPs directas de ClusterIP porque el DNS entre namespaces no funciona correctamente en este entorno de laboratorio. Las IPs de ClusterIP son estables dentro del ciclo de vida del servicio.

---

## Como desplegar el stack

```bash
# 1. Crear y etiquetar el namespace
kubectl create namespace monitoring
kubectl label namespace monitoring pod-security.kubernetes.io/enforce=privileged --overwrite

# 2. Desplegar en orden
kubectl apply -f node-exporter-daemonset.yaml
kubectl apply -f kube-state-metrics-rbac.yaml
kubectl apply -f kube-state-metrics-deployment.yaml
kubectl apply -f kube-state-metrics-service.yaml
kubectl apply -f prometheus-pvc.yaml
kubectl apply -f prometheus-configmap.yaml
kubectl apply -f prometheus-deployment.yaml
kubectl apply -f prometheus-service.yaml
kubectl apply -f grafana-pvc.yaml
kubectl apply -f grafana-deployment.yaml
kubectl apply -f grafana-service.yaml
kubectl apply -f loki-pvc.yaml
kubectl apply -f loki-configmap.yaml
kubectl apply -f loki-deployment.yaml
kubectl apply -f loki-service.yaml
kubectl apply -f promtail-rbac.yaml
kubectl apply -f promtail-configmap.yaml
kubectl apply -f promtail-daemonset.yaml

# 3. Abrir puertos en el firewall
ansible k8s_cluster -i ~/ansible-k8s/inventory/hosts.ini \
  -m shell \
  -a "firewall-cmd --permanent --add-port=9100/tcp --add-port=30900/tcp --add-port=30300/tcp && firewall-cmd --reload" \
  --become

# 4. Verificar
kubectl get all -n monitoring
kubectl get pvc -n monitoring
```

---

## Acceso a Grafana

```
URL:      http://192.168.28.139:30300
Usuario:  admin
Password: bootcamp2026
```

Dashboards importados:
- Node Exporter Full (ID 1860): metricas de CPU, RAM, disco y red de cada nodo
- Kubernetes Cluster Monitoring (ID 315): estado general del cluster

---

## Nota sobre recursos de memoria

Con workers de 2 GB de RAM, no todos los componentes pueden correr simultaneamente. Durante la presentacion se recomienda escalar a cero los que no se esten usando activamente:

```bash
# Liberar memoria antes de demos
kubectl scale deployment loki -n monitoring --replicas=0
kubectl scale deployment kube-state-metrics -n monitoring --replicas=0

# Restaurar despues
kubectl scale deployment loki -n monitoring --replicas=1
kubectl scale deployment kube-state-metrics -n monitoring --replicas=1
```
