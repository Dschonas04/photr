# Photr

[![prüfen](https://github.com/Dschonas04/photr/actions/workflows/pruefen.yml/badge.svg)](https://github.com/Dschonas04/photr/actions/workflows/pruefen.yml)
[![Release](https://img.shields.io/github/v/release/Dschonas04/photr?label=Version)](https://github.com/Dschonas04/photr/releases/latest)
[![Go 1.27](https://img.shields.io/badge/Go-1.27-00ADD8)](https://go.dev)
[![React 19](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)
[![Lizenz: MIT](https://img.shields.io/badge/Lizenz-MIT-blue.svg)](LICENSE)

<img src="docs/logo.svg" alt="" width="96" align="right">

Bilder teilen: Sammlungen anlegen, gestalten und mit anderen teilen.

![Photr in zwanzig Sekunden: öffentliche Sammlungen auf der Startseite, eine Sammlung mit Fotos und Text, die eigene Übersicht](docs/bilder/rundgang.gif)

*Zwanzig Sekunden: eine öffentliche Sammlung öffnen, durch die Seiten
blättern, zurück in die eigene Übersicht und die nächste Sammlung ansehen.*

| Startseite | Eine Sammlung | Meine Sammlungen |
| --- | --- | --- |
| ![Startseite mit öffentlichen Sammlungen als farbige Karten](docs/bilder/start.png) | ![Seite einer Sammlung mit Titel, Text und Foto](docs/bilder/sammlung.png) | ![Übersicht der eigenen Sammlungen](docs/bilder/uebersicht.png) |
| Öffentliche Sammlungen sieht jeder. | Jede Seite mit Titel, Text und Bild. | Eigene Sammlungen anlegen, öffentlich oder privat. |

## Technologie-Stack

| Schicht    | Technologie                       |
|------------|-----------------------------------|
| Frontend   | React 19 + TypeScript + Vite 8    |
| Backend    | Go 1.27 + Gin                     |
| Datenbank  | PostgreSQL 16                     |
| Container  | Docker + Docker Compose           |
| Kubernetes | Kind (Kubernetes in Docker)       |

Eine Sammlung hat einen Titel, eine Beschreibung, eine Farbe und beliebig viele
Seiten mit Text und Bild. Sie ist privat oder öffentlich; öffentliche
Sammlungen erscheinen auf der Startseite. In API und Datenbank heißen
Sammlungen `scrapbooks`.

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

### Option 1: Automatisches Setup (empfohlen)

```bash
chmod +x setup.sh
./setup.sh
```

Danach `/etc/hosts` ergänzen:
```
127.0.0.1  photr.local
```
→ Browser öffnen: **http://photr.local:8000**

### Option 2: Schritt für Schritt (Makefile)

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

### Option 3: Lokale Entwicklung (Docker Compose)

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
| Namespace          | `photr`                                   |
| Secret             | DB-Passwort + JWT-Secret                  |
| ConfigMap          | DB-Host, Port, Name, User                 |
| PVC (2Gi)          | Persistenter Speicher für PostgreSQL      |
| PostgreSQL Dep.    | 1 Replica, Liveness/Readiness Probes      |
| Backend Dep.       | 2 Replicas, Liveness/Readiness Probes     |
| Frontend Dep.      | 2 Replicas, Liveness/Readiness Probes     |
| Ingress            | `photr.local` → Frontend + Backend        |

## API-Übersicht

| Methode | Endpunkt                          | Beschreibung                  | Auth |
|---------|-----------------------------------|-------------------------------|------|
| GET     | `/health`                         | Health Check                  |: |
| POST    | `/api/auth/register`              | Registrierung                 |: |
| POST    | `/api/auth/login`                 | Anmeldung                     |: |
| GET     | `/api/auth/me`                    | Aktueller Benutzer            | ✓    |
| GET     | `/api/public/scrapbooks`          | Öffentliche Sammlungen        |: |
| GET     | `/api/scrapbooks`                 | Eigene Sammlungen             | ✓    |
| POST    | `/api/scrapbooks`                 | Sammlung anlegen              | ✓    |
| GET     | `/api/scrapbooks/:id`             | Sammlung abrufen              | ✓    |
| DELETE  | `/api/scrapbooks/:id`             | Sammlung löschen              | ✓    |
| GET     | `/api/scrapbooks/:id/pages`       | Seiten einer Sammlung         | ✓    |
| POST    | `/api/scrapbooks/:id/pages`       | Seite hinzufügen              | ✓    |
| DELETE  | `/api/scrapbooks/:id/pages/:pid`  | Seite löschen                 | ✓    |

## Umgebungsvariablen (Backend)

| Variable      | Standard                    | Beschreibung        |
|---------------|-----------------------------|---------------------|
| `DB_HOST`     | `localhost`                 | PostgreSQL-Host     |
| `DB_PORT`     | `5432`                      | PostgreSQL-Port     |
| `DB_USER`     | `photr`                     | Datenbankbenutzer   |
| `DB_PASSWORD` | `photr`                     | Datenbankpasswort   |
| `DB_NAME`     | `photr`                     | Datenbankname       |
| `JWT_SECRET`  | `change-me-in-production`   | JWT-Signaturschlüssel|
| `SERVER_PORT` | `8080`                      | API-Port            |

Für den Betrieb `JWT_SECRET` und `DB_PASSWORD` unbedingt setzen, in Kubernetes
über `k8s/secrets.yaml` (Platzhalter ersetzen).

## Mitmachen

`make docker-up` startet alles lokal. Vor einem Pull Request:

```bash
cd backend && gofmt -l . && go vet ./... && go test ./...
cd frontend && npm ci && npm run build
```

Die CI prüft dasselbe und startet zusätzlich den ganzen Stapel mit Docker
Compose. Sicherheitslücken bitte nach [SECURITY.md](SECURITY.md) melden.

## Fertige Images

Zu jedem Release liegen Images für amd64 und arm64 auf GitHub Packages und
auf Docker Hub (`docker.io/dschohnas/…`, gleiche Namen und Tags):

- `ghcr.io/dschonas04/photr-backend`
- `ghcr.io/dschonas04/photr-frontend`

Tags: `latest`, die Version (`1.2.3`) sowie `1.2` und `1`. In `docker-compose.yml` statt `build:` jeweils `image: ghcr.io/dschonas04/photr-backend:1` bzw. `photr-frontend:1` eintragen.

## Lizenz

MIT, siehe [LICENSE](LICENSE).
