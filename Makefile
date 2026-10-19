.PHONY: help cluster-create cluster-delete build-images load-images deploy-k8s deploy-ingress \
        deploy-all delete-all port-forward docker-up docker-down

CLUSTER_NAME  := photr
BACKEND_IMG   := photr/backend:latest
FRONTEND_IMG  := photr/frontend:latest
NAMESPACE     := photr

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-28s\033[0m %s\n", $$1, $$2}'

# ─── Kind Cluster ──────────────────────────────────────────────────────────────

cluster-create: ## Create the Kind cluster
	kind create cluster --name $(CLUSTER_NAME) --config kind-config.yaml
	@echo "✅ Kind cluster '$(CLUSTER_NAME)' created"

cluster-delete: ## Delete the Kind cluster
	kind delete cluster --name $(CLUSTER_NAME)

# ─── Docker Images ─────────────────────────────────────────────────────────────

build-images: ## Build Docker images for backend and frontend
	docker build -t $(BACKEND_IMG) ./backend
	docker build -t $(FRONTEND_IMG) ./frontend
	@echo "✅ Images built"

load-images: ## Load images into Kind cluster
	kind load docker-image $(BACKEND_IMG) --name $(CLUSTER_NAME)
	kind load docker-image $(FRONTEND_IMG) --name $(CLUSTER_NAME)
	@echo "✅ Images loaded into Kind cluster"

# ─── Ingress Controller ────────────────────────────────────────────────────────

deploy-ingress: ## Deploy nginx ingress controller into Kind cluster
	kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
	kubectl wait --namespace ingress-nginx \
	  --for=condition=ready pod \
	  --selector=app.kubernetes.io/component=controller \
	  --timeout=120s
	@echo "✅ Ingress controller ready"

# ─── Kubernetes Manifests ──────────────────────────────────────────────────────

deploy-k8s: ## Apply all Kubernetes manifests
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/secrets.yaml
	kubectl apply -f k8s/configmap.yaml
	kubectl apply -f k8s/postgres/pvc.yaml
	kubectl apply -f k8s/postgres/deployment.yaml
	kubectl apply -f k8s/postgres/service.yaml
	kubectl rollout status deployment/postgres -n $(NAMESPACE) --timeout=120s
	kubectl apply -f k8s/backend/deployment.yaml
	kubectl apply -f k8s/backend/service.yaml
	kubectl rollout status deployment/backend -n $(NAMESPACE) --timeout=120s
	kubectl apply -f k8s/frontend/deployment.yaml
	kubectl apply -f k8s/frontend/service.yaml
	kubectl apply -f k8s/ingress.yaml
	@echo "✅ All manifests applied"

delete-all: ## Delete all photr resources from cluster
	kubectl delete namespace $(NAMESPACE) --ignore-not-found

# ─── All-in-one ────────────────────────────────────────────────────────────────

deploy-all: cluster-create build-images load-images deploy-ingress deploy-k8s ## Full setup: cluster + images + k8s
	@echo ""
	@echo "🎉 Photr is running!"
	@echo "   Add to /etc/hosts:  127.0.0.1 photr.local"
	@echo "   Open:               http://photr.local:8000"

# ─── Local Dev (Docker Compose) ────────────────────────────────────────────────

docker-up: ## Start local dev environment with docker-compose
	docker compose up --build -d
	@echo "✅ Dev environment running on http://localhost:3000"

docker-down: ## Stop local dev environment
	docker compose down -v

# ─── Utils ─────────────────────────────────────────────────────────────────────

port-forward: ## Port-forward frontend to localhost:3000 (Kind)
	kubectl port-forward -n $(NAMESPACE) svc/frontend 3000:80 &
	kubectl port-forward -n $(NAMESPACE) svc/backend 8080:8080 &
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8080"

status: ## Show pod status in namespace
	kubectl get pods -n $(NAMESPACE)
