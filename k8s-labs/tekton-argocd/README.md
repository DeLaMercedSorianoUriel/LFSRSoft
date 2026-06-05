# tekton-argocd

Manifiestos de Tekton Pipelines y ArgoCD para el CI/CD GitOps del proyecto LFSRSoft.

---

## Arquitectura del pipeline GitOps

```
Desarrollador hace git push
        |
        | Tekton (integracion continua)
        v
Task git-clone  ->  clona el repo en workspace NFS
        |
        v
Task build-push ->  Kaniko construye la imagen y la sube a Docker Hub
        |
        | ArgoCD (despliegue continuo)
        v
Detecta cambio en k8s/deployment.yaml del repo
        |
        v
Actualiza el Deployment en el cluster automaticamente
```

---

## Archivos incluidos

| Archivo | Recurso | Descripcion |
|---|---|---|
| task-git-clone.yaml | Task | Clona el repositorio usando alpine/git |
| task-build-push.yaml | Task | Construye y publica la imagen con Kaniko |
| pipeline-build-deploy.yaml | Pipeline | Encadena git-clone seguido de build-push |
| pipelinerun-demo.yaml | PipelineRun | Ejemplo de ejecucion del pipeline |

---

## Como desplegar Tekton

```bash
# Instalar Tekton Pipelines v1.6.0
kubectl apply -f https://storage.googleapis.com/tekton-releases/pipeline/v1.6.0/release.yaml

# Etiquetar el namespace para Kaniko
kubectl label namespace tekton-pipelines \
  pod-security.kubernetes.io/enforce=privileged --overwrite

# Crear el Secret de Docker Hub
kubectl create secret docker-registry docker-credentials \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=uriel0331dls \
  --docker-password=TOKEN \
  -n tekton-pipelines

# Aplicar Tasks y Pipeline
kubectl apply -f task-git-clone.yaml
kubectl apply -f task-build-push.yaml
kubectl apply -f pipeline-build-deploy.yaml

# Verificar
kubectl get task,pipeline -n tekton-pipelines
```

---

## Como correr el pipeline

```bash
# Editar pipelinerun-demo.yaml con el tag de imagen deseado, luego:
kubectl apply -f pipelinerun-demo.yaml

# Monitorear en tiempo real
tkn pipelinerun logs build-and-deploy-run-1 -f -n tekton-pipelines
```

---

## Limitacion conocida en el entorno de laboratorio

El PipelineRun con Kaniko no puede completarse en VMs de 2 GB de RAM. El paso de git-clone funciona correctamente. El paso de build-push falla porque compilar Go dentro de Kaniko requiere al menos 512 MB de RAM libre, y los workers no tienen suficiente disponible cuando hay otros pods corriendo.

El pipeline esta correctamente configurado y funcionaria en nodos con 4 GB o mas de RAM.

---

## ArgoCD

```bash
# Instalar ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Exponer con NodePort
kubectl patch svc argocd-server -n argocd \
  -p '{"spec":{"type":"NodePort","ports":[{"port":443,"nodePort":30443,"targetPort":8080,"protocol":"TCP","name":"https"}]}}'

# Obtener la contrasena inicial
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Login con el CLI
argocd login 192.168.28.139:30443 --insecure --username admin --password PASSWORD

# Crear la Application del proyecto
kubectl apply -f ../../argocd-application.yaml

# Verificar
kubectl get application lfsr-app -n argocd
```

---

## Acceso a la UI de ArgoCD

```
URL:      https://192.168.28.139:30443
Usuario:  admin
Password: ver el Secret argocd-initial-admin-secret
```

La Application `lfsr-app` monitorea el directorio `proyecto-lfsrsoft/k8s` de la rama `Develop` del repositorio y sincroniza automaticamente cada cambio al namespace `lfsrsoft` del cluster.

---

## Demo GitOps que se realizo

```bash
# 1. Cambiar el tag de imagen en el repo
cd ~/lfsr-proyecto
sed -i 's|lfsr-frontend:v1|lfsr-frontend:v4|g' \
  proyecto-lfsrsoft/k8s/frontend-deployment.yaml

# 2. Push a GitHub
git add .
git commit -m "feat: actualizar frontend a v4"
git push origin Develop

# 3. ArgoCD detecta el cambio en ~3 minutos y actualiza el Deployment
# sin que se ejecute ningun kubectl apply manual
kubectl get pods -n lfsrsoft
# Los pods del frontend aparecen con la nueva version
```
