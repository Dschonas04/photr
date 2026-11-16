#!/usr/bin/env bash
# setup.sh: One-shot setup for the Photr Kind cluster
set -euo pipefail

CLUSTER_NAME="photr"

check_tool() {
  if ! command -v "$1" &>/dev/null; then
    echo "❌ $1 is required but not installed. Aborting."
    exit 1
  fi
}

echo "🔍 Checking required tools..."
check_tool docker
check_tool kind
check_tool kubectl

echo "🏗️  Creating Kind cluster..."
if kind get clusters | grep -q "^${CLUSTER_NAME}$"; then
  echo "   Cluster '${CLUSTER_NAME}' already exists, skipping creation."
else
  kind create cluster --name "${CLUSTER_NAME}" --config kind-config.yaml
fi

echo "🐳 Building Docker images..."
docker build -t photr/backend:latest ./backend
docker build -t photr/frontend:latest ./frontend

echo "📦 Loading images into Kind..."
kind load docker-image photr/backend:latest --name "${CLUSTER_NAME}"
kind load docker-image photr/frontend:latest --name "${CLUSTER_NAME}"

echo "🌐 Installing nginx ingress controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
echo "   Waiting for ingress controller to be ready (up to 120s)..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

echo "🚀 Deploying Photr to Kubernetes..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres/pvc.yaml
kubectl apply -f k8s/postgres/deployment.yaml
kubectl apply -f k8s/postgres/service.yaml

echo "   Waiting for PostgreSQL..."
kubectl rollout status deployment/postgres -n photr --timeout=120s

kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml

echo "   Waiting for backend..."
kubectl rollout status deployment/backend -n photr --timeout=120s

kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml
kubectl apply -f k8s/ingress.yaml

echo ""
echo "✅ Setup complete!"
echo ""
echo "   Add the following entry to /etc/hosts (requires sudo):"
echo "     127.0.0.1  photr.local"
echo ""
echo "   Then open: http://photr.local:8000"
echo ""
echo "   Or use port-forward for quick access:"
echo "     kubectl port-forward -n photr svc/frontend 3000:80"
echo "     → http://localhost:3000"
