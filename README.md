# 🌦 WeatherWise – CI/CD Erweiterung des C1-Projekts

## 📌 Projektbeschreibung

Dieses Projekt basiert auf dem bereits im Auftrag C1 entwickelten Projekt **WeatherWise**, einer modernen und responsiven Wetter-Web-Applikation.
Im Rahmen von C1 wurde eine containerisierte Multi-Service-Architektur mit Docker Compose umgesetzt.

Für den Auftrag C2 wurde das bestehende Projekt weiterentwickelt und um eine vollständige CI/CD-Pipeline mit GitHub Actions erweitert. Ziel war es, den bisherigen manuellen Build- und Deployment-Prozess zu automatisieren und eine reproduzierbare sowie produktionsnahe Deployment-Umgebung zu schaffen.

Das bestehende Projekt aus C1 wurde bewusst weiterverwendet, da dadurch ein realistischer Entwicklungsprozess simuliert werden konnte:
Eine bestehende Anwendung wird nicht neu erstellt, sondern professionell erweitert und automatisiert deployt.

---

# 🎯 Ziel des Projekts

Die Anwendung dient dazu, aktuelle Wetterdaten und Vorhersagen für beliebige Städte weltweit bereitzustellen.

Zusätzlich bestand das Ziel darin, moderne DevOps- und Deployment-Praktiken umzusetzen:

* Containerisierung mit Docker
* Multi-Service-Architektur
* Reverse Proxy mit Nginx
* Caching mit Redis
* Automatisierte CI/CD-Pipeline
* Automatisierte Docker-Builds
* Veröffentlichung von Container-Images in einer Registry
* Nutzung von GitHub Actions
* Reproduzierbare Deployments

---

# 🏗 Architektur

Die Anwendung besteht aus mehreren Services:

| Service  | Beschreibung                                 |
| -------- | -------------------------------------------- |
| Frontend | React/Vite SPA ausgeliefert über Nginx       |
| Backend  | Node.js API zur Verarbeitung der Wetterdaten |
| Cache    | Redis zur Zwischenspeicherung                |
| CI/CD    | GitHub Actions Workflow zur Automatisierung  |

---

# 🔗 Datenfluss

```text
User → Frontend (Nginx)
        ↓
     Backend API
        ↓
      Redis Cache
        ↓
 External Weather API
```

---

# ⚙️ Erweiterung von C1 zu C2

Im Auftrag C1 lag der Fokus hauptsächlich auf:

* Dockerisierung
* Multi-Service-Deployment
* Redis-Caching
* Docker Compose
* Service-Kommunikation

Im Auftrag C2 wurde das Projekt um professionelle CI/CD-Funktionalitäten erweitert.

Dabei wurden folgende Erweiterungen implementiert:

* GitHub Actions Workflow
* Automatisierte Tests
* Automatisierter Docker-Build
* Automatisierter Push in eine Container Registry
* Docker Layer Caching
* Dependency Caching
* Image Tagging mit SHA
* Sichere Nutzung von GitHub Secrets

---

# 🔄 CI/CD Pipeline Übersicht

Die Pipeline wird automatisch bei jedem Push auf den `main`-Branch ausgeführt.

## Ablauf der Pipeline

```text
Push auf main
    ↓
Test Stage
    ↓
Docker Build Stage
    ↓
Push Stage (GHCR)
```

Wenn eine Stage fehlschlägt, wird die Pipeline sofort gestoppt und kein Image veröffentlicht.

---

# 🧪 Test Stage

In der Test-Stage werden automatische Qualitätsprüfungen durchgeführt.

## Verwendete Befehle

```bash
npm ci
npm run lint
npm run build
```

### Ziel der Test-Stage

* Überprüfung der Codequalität
* Erkennung von Syntaxfehlern
* Sicherstellung eines erfolgreichen Produktions-Builds

Für die Qualitätsprüfung wird ESLint verwendet.

---

# 🐳 Docker Build Stage

Nach erfolgreichem Test wird automatisch ein Docker-Image erzeugt.

Das Projekt verwendet ein Multi-Stage-Dockerfile:

## Builder Stage

* Installation der Dependencies
* Erstellen des Production-Builds

## Runtime Stage

* Auslieferung der statischen Dateien über Nginx
* Minimierung der finalen Image-Größe

---

# 📦 Container Registry

Als Container Registry wurde die **GitHub Container Registry (GHCR)** verwendet.

## Gründe für diese Wahl

* Direkte Integration in GitHub
* Keine zusätzliche Registry notwendig
* Einfache Authentifizierung mit `GITHUB_TOKEN`
* Gute Integration mit GitHub Actions

Das fertige Image wird automatisch nach erfolgreichem Build veröffentlicht.

---

# 🏷 Tagging Strategie

Jedes Docker-Image erhält zwei Tags:

| Tag          | Beschreibung                    |
| ------------ | ------------------------------- |
| latest       | Aktuellste stabile Version      |
| sha-<commit> | Eindeutige Build-Identifikation |

Beispiel:

```text
latest
sha-a1b2c3d
```

Dadurch bleibt jeder Build nachvollziehbar und reproduzierbar.

---

# 🔐 Secrets Management

Sensitive Daten werden nicht im Repository gespeichert.

Die Pipeline verwendet:

```text
${{ secrets.GITHUB_TOKEN }}
```

Dadurch bleiben Zugangsdaten geschützt und werden erst zur Laufzeit in die Pipeline eingefügt.

Es befinden sich keine Credentials im Quellcode oder Repository.

---

# ⚡ Caching

Zur Optimierung der Pipeline wurden mehrere Caching-Mechanismen verwendet.

## Dependency Cache

```yaml
cache: npm
```

Dadurch müssen Dependencies nicht bei jedem Build erneut heruntergeladen werden.

---

## Docker Layer Cache

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

Dadurch werden bereits gebaute Docker-Layer wiederverwendet.

Das reduziert die Build-Zeit deutlich.

---

# 🚀 GitHub Actions Workflow

Der Workflow befindet sich unter:

```text
.github/workflows/ci-cd.yml
```

## Verwendete Trigger

| Trigger           | Beschreibung          |
| ----------------- | --------------------- |
| push auf main     | Vollständige Pipeline |
| workflow_dispatch | Manueller Start       |

---

# ⚙️ Setup Anleitung

## Voraussetzungen

* Docker installiert
* Git installiert
* GitHub Account
* Node.js installiert

---

## Projekt starten

```bash
docker compose up --build
```

---

## Lokale Entwicklung

```bash
npm install
npm run dev
```

---

# 📂 Projektstruktur

```text
.github/
 └── workflows/
      └── ci-cd.yml

backend/
public/
src/

Dockerfile
docker-compose.yml
nginx.conf

package.json
README.md
```

---

# 🧠 Architektur-Entscheidungen

## Warum GitHub Actions?

GitHub Actions bietet eine direkte Integration in GitHub-Repositories und ermöglicht einfache sowie automatisierte CI/CD-Workflows.

---

## Warum GHCR?

GHCR vereinfacht die Verwaltung von Docker-Images und benötigt keine externe Registry.

---

## Warum Multi-Stage Docker Builds?

Dadurch wird die Größe des finalen Images reduziert und die Sicherheit verbessert.

---

## Warum Redis?

Redis reduziert externe API-Aufrufe und verbessert die Performance der Anwendung.

---

# 🧠 Reflexion

Während der Umsetzung von C2 habe ich gelernt:

* Aufbau automatisierter CI/CD-Pipelines
* Nutzung von GitHub Actions
* Automatisiertes Container-Building
* Veröffentlichung von Images in einer Registry
* Verwendung von Docker Layer Caching
* Nutzung von GitHub Secrets
* Strukturierung professioneller Deployment-Prozesse

Besonders hilfreich war die Kombination aus dem bestehenden C1-Projekt und den neuen CI/CD-Komponenten, da dadurch ein realistischer Entwicklungsprozess simuliert wurde.

Rückblickend würde ich zusätzlich:

* Unit Tests integrieren
* Automatische Deployments in die Cloud hinzufügen
* Semantic Versioning ergänzen
* Monitoring und Logging erweitern

---

# 📜 KI-Unterstützung

Für die Erstellung einzelner Konfigurationsbestandteile und zur Unterstützung bei der Strukturierung der CI/CD-Pipeline wurden KI-Tools verwendet.

Alle verwendeten Konfigurationen und Workflows wurden verstanden, angepasst und eigenständig getestet.

---

# 📜 Lizenz

Dieses Projekt wurde im Rahmen des Moduls WEB2 / DEP an der GIBB Bern erstellt.
