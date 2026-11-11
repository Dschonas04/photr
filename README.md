# Photr

<img src="docs/logo.svg" alt="" width="96" align="right">

Bilder teilen: Sammlungen anlegen, gestalten und mit anderen teilen.

## Technologie-Stack

| Schicht    | Technologie              |
|------------|--------------------------|
| Frontend   | React 18 + TypeScript + Vite |
| Backend    | Go 1.22 + Gin            |
| Datenbank  | PostgreSQL 16            |
| Container  | Docker + Docker Compose  |
| Kubernetes | Kind (Kubernetes in Docker) |

## Projektstruktur

```
photr/
├── backend/              # Go REST API
│   ├── cmd/server/       # Einstiegspunkt
│   ├── config/           # Konfiguration (Env-Variablen)
│   ├── internal/
│   │   ├── api/          # Router + Handler
│   │   ├── db/           # Datenbankverbindung & Migration
│   │   ├── middleware/   # JWT-Authentifizierung
│   │   └── models/       # Datenmodelle
│   └── Dockerfile
├── frontend/             # React-Applikation
│   ├── src/
│   │   ├── api/          # Axios-Client
│   │   ├── components/   # Wiederverwendbare Komponenten
│   │   ├── pages/        # Seitenkomponenten
│   │   └── types/        # TypeScript-Typen
│   ├── nginx.conf        # Nginx-Konfiguration
│   └── Dockerfile
├── k8s/                  # Kubernetes-Manifeste
│   ├── namespace.yaml
│   ├── secrets.yaml
│   ├── configmap.yaml
│   ├── postgres/         # PostgreSQL Deployment + Service + PVC
│   ├── backend/          # Backend Deployment + Service
│   ├── frontend/         # Frontend Deployment + Service
│   └── ingress.yaml      # Nginx Ingress
├── kind-config.yaml      # Kind-Cluster-Konfiguration
├── docker-compose.yml    # Lokale Entwicklungsumgebung
├── Makefile              # Befehle für Cluster & Deployment
└── setup.sh              # Einmaliges Setup-Skript
```

## Schnellstart

### Voraussetzungen

- [Docker](https://docs.docker.com/get-docker/)
- [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

### Option 1 – Automatisches Setup (empfohlen)

```bash
chmod +x setup.sh
./setup.sh
```

Danach `/etc/hosts` ergänzen:
```
127.0.0.1  photr.local
```
→ Browser öffnen: **http://photr.local:8000**

### Option 2 – Schritt für Schritt (Makefile)

```bash
# Alles auf einmal
make deploy-all

# Oder einzeln:
make cluster-create     # Kind-Cluster anlegen
make build-images       # Docker-Images bauen
make load-images        # Images in Kind laden
make deploy-ingress     # Nginx Ingress installieren
make deploy-k8s         # Kubernetes-Manifeste anwenden

make status             # Pod-Status anzeigen
make port-forward       # Port-Forwarding starten
```

### Option 3 – Lokale Entwicklung (Docker Compose)

```bash
make docker-up
# → Frontend: http://localhost:3000
# → Backend:  http://localhost:8080

make docker-down   # Beenden
```

## Kubernetes-Architektur

```
Internet
    │
    ▼
[Ingress (nginx)]
    │
    ├──/api──► [Backend Pods (Go, 2x)] ──► [PostgreSQL]
    │
    └────────► [Frontend Pods (Nginx, 2x)]
```

### Kind-Cluster

- 1 Control-Plane-Node (mit Port-Mapping 80→8000, 443→8443)
- 2 Worker-Nodes

### Kubernetes-Ressourcen

| Ressource          | Beschreibung                              |
|--------------------|-------------------------------------------|
| Namespace          | `photr`                              |
| Secret             | DB-Passwort + JWT-Secret                  |
| ConfigMap          | DB-Host, Port, Name, User                 |
| PVC (2Gi)          | Persistenter Speicher für PostgreSQL      |
| PostgreSQL Dep.    | 1 Replica, Liveness/Readiness Probes      |
| Backend Dep.       | 2 Replicas, Liveness/Readiness Probes     |
| Frontend Dep.      | 2 Replicas, Liveness/Readiness Probes     |
| Ingress            | `photr.local` → Frontend + Backend   |

## API-Übersicht

| Methode | Endpunkt                          | Beschreibung                  | Auth |
|---------|-----------------------------------|-------------------------------|------|
| GET     | `/health`                         | Health Check                  | –    |
| POST    | `/api/auth/register`              | Registrierung                 | –    |
| POST    | `/api/auth/login`                 | Anmeldung                     | –    |
| GET     | `/api/auth/me`                    | Aktueller Benutzer            | ✓    |
| GET     | `/api/public/scrapbooks`          | Öffentliche Scrapbooks        | –    |
| GET     | `/api/scrapbooks`                 | Eigene Scrapbooks             | ✓    |
| POST    | `/api/scrapbooks`                 | Scrapbook erstellen           | ✓    |
| GET     | `/api/scrapbooks/:id`             | Scrapbook abrufen             | ✓    |
| DELETE  | `/api/scrapbooks/:id`             | Scrapbook löschen             | ✓    |
| GET     | `/api/scrapbooks/:id/pages`       | Seiten eines Scrapbooks       | ✓    |
| POST    | `/api/scrapbooks/:id/pages`       | Seite hinzufügen              | ✓    |
| DELETE  | `/api/scrapbooks/:id/pages/:pid`  | Seite löschen                 | ✓    |

## Umgebungsvariablen (Backend)

| Variable      | Standard                    | Beschreibung        |
|---------------|-----------------------------|---------------------|
| `DB_HOST`     | `localhost`                 | PostgreSQL-Host     |
| `DB_PORT`     | `5432`                      | PostgreSQL-Port     |
| `DB_USER`     | `photr`                | Datenbankbenutzer   |
| `DB_PASSWORD` | `photr`                | Datenbankpasswort   |
| `DB_NAME`     | `photr`                | Datenbankname       |
| `JWT_SECRET`  | `change-me-in-production`   | JWT-Signaturschlüssel|
| `SERVER_PORT` | `8080`                      | API-Port            |
