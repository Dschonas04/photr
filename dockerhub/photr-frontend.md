# Photr Frontend

Photr: Bilder teilen, Sammlungen anlegen, gestalten und mit anderen teilen. Dieses Image ist die Weboberfläche (nginx mit React); die API ist `dschohnas/photr-backend`.

Quellcode, Kubernetes-Manifeste und Anleitung: [https://github.com/Dschonas04/photr](https://github.com/Dschonas04/photr)

## Start

Photr besteht aus `photr-backend` (Go, Port 8080), `photr-frontend` (nginx mit React, Port 80) und PostgreSQL. Das Frontend leitet `/api` an den Dienst `backend` weiter.

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: photr
      POSTGRES_USER: photr
      POSTGRES_PASSWORD: photr
    volumes: [postgres_data:/var/lib/postgresql/data]
  backend:
    image: dschohnas/photr-backend:1
    environment:
      DB_HOST: postgres
      DB_NAME: photr
      DB_USER: photr
      DB_PASSWORD: photr
      JWT_SECRET: bitte-durch-mindestens-32-zufaellige-zeichen-ersetzen
    depends_on: [postgres]
  frontend:
    image: dschohnas/photr-frontend:1
    ports: ["3000:80"]
    depends_on: [backend]
volumes:
  postgres_data:
```

Danach läuft Photr unter `http://<host>:3000`.

## Tags

`latest`, die genaue Version (`1.0.0`) sowie `1.0` und `1`. Jedes Image gibt es für `linux/amd64` und `linux/arm64`. Dieselben Images liegen auch unter `ghcr.io/dschonas04/photr-frontend`.

## Lizenz

MIT
