# 🌩 WeatherWise – Cloud Deployment Erweiterung des C2-Projekts

## 📌 Projektbeschreibung

Dieses Projekt basiert auf dem bereits in den Aufträgen C1 und C2 entwickelten Projekt **WeatherWise**, einer modernen und responsiven Wetter-Web-Applikation.

Im Auftrag C1 wurde eine containerisierte Multi-Service-Architektur mit Docker Compose umgesetzt.
Im Auftrag C2 wurde das Projekt zusätzlich um eine vollständige CI/CD-Pipeline mit GitHub Actions erweitert.

Für den Auftrag C3 wurde das bestehende Projekt erfolgreich auf eine Cloud-Plattform deployt und produktionsnah erweitert.

Das Ziel bestand darin, eine reale Cloud-Deployment-Umgebung aufzubauen, in der Frontend, Backend und Redis öffentlich erreichbar, automatisiert deploybar und reproduzierbar betrieben werden können.

Dabei wurde bewusst das bestehende Projekt weiterverwendet, um einen realistischen Entwicklungsprozess abzubilden:
Eine bestehende Anwendung wird schrittweise erweitert, automatisiert und produktionsnah in die Cloud deployt.

---

# 🎯 Ziel des Projekts

Die Anwendung dient dazu, aktuelle Wetterdaten und Vorhersagen für beliebige Städte weltweit bereitzustellen.

Zusätzlich bestand das Ziel darin, moderne Cloud- und Deployment-Praktiken umzusetzen:

- Cloud Deployment mit Railway
- Public Hosting der Anwendung
- Deployment einer Multi-Service-Architektur
- Backend API mit Redis-Caching
- Reverse Proxy mit Nginx
- Automatische Deployments über GitHub
- Health Checks
- Reproduzierbare Cloud-Deployments
- Persistente Service-Kommunikation
- Produktivnahe Infrastruktur

---

# ☁️ Verwendete Cloud-Plattform

Für das Cloud Deployment wurde **Railway** verwendet.

## Gründe für die Wahl von Railway

- Einfache Integration mit GitHub
- Automatische Deployments
- Unterstützung für Docker-basierte Projekte
- Einfache Verwaltung mehrerer Services
- Öffentliche Deployment-URLs
- Gute Übersicht über Logs und Deployments
- Integrierte Environment Variables

---

# 🏗 Architektur

Die Anwendung besteht aus mehreren Cloud-Services:

| Service  | Beschreibung                                 |
| -------- | -------------------------------------------- |
| Frontend | React/Vite SPA ausgeliefert über Nginx       |
| Backend  | Node.js API zur Verarbeitung der Wetterdaten |
| Cache    | Redis zur Zwischenspeicherung                |
| Cloud    | Railway Hosting Plattform                    |

---

# 🖼 Architekturdiagramm

```text
┌──────────────────────┐
│      Frontend        │
│ React / Vite / Nginx │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Backend API     │
│   Node.js / Express  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Redis Cache     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    Open-Meteo API    │
└──────────────────────┘
```

---

# 🔗 Datenfluss

```text
User
  ↓
Frontend (Nginx / Railway)
  ↓
Backend API
  ↓
Redis Cache
  ↓
Open-Meteo API
```

---

# 🚀 Cloud Deployment Architektur

Die Anwendung wurde in Railway als Multi-Service-Projekt umgesetzt.

## Enthaltene Services

| Service          | Funktion                      |
| ---------------- | ----------------------------- |
| Frontend Service | Auslieferung der SPA          |
| Backend Service  | Verarbeitung der API-Anfragen |
| Redis Service    | Caching der Wetterdaten       |

Alle Services kommunizieren innerhalb des Railway-Netzwerks miteinander.

---

# 🌐 Öffentliche Endpoints

## Frontend

```text
https://c3-cloud-deployment-production.up.railway.app
```

## Backend Health Check

```text
/health
```

Vollständige URL:

```text
https://laudable-eagerness-production-0b03.up.railway.app/health
```

Der Endpoint überprüft:

- Backend-Verfügbarkeit
- Redis-Verbindung
- Service-Status

Beispiel:

```json
{
  "status": "healthy",
  "redis": "connected"
}
```

---

## Weather API Endpoint

```text
/api/weather?city=Zurich
```

Vollständige URL:

```text
https://laudable-eagerness-production-0b03.up.railway.app/api/weather?city=Zurich
```

Der Endpoint liefert aktuelle Wetterdaten als JSON zurück.

---

# 🔄 Deployment Prozess

Das Projekt ist direkt mit GitHub verbunden.

## Deployment Ablauf

```text
Git Push
   ↓
GitHub Repository
   ↓
Automatisches Railway Deployment
   ↓
Build
   ↓
Container Start
   ↓
Öffentliche Bereitstellung
```

Jeder Push auf den `main`-Branch startet automatisch ein neues Cloud Deployment.

---

# 🐳 Docker Integration

Das Projekt verwendet weiterhin Docker-basierte Deployments.

## Frontend

- Multi-Stage Docker Build
- Production Build mit Vite
- Auslieferung über Nginx

## Backend

- Node.js Express API
- Redis-Verbindung
- Health Endpoint
- JSON Logging

---

# ⚡ Redis Caching

Redis wird verwendet, um Wetterdaten temporär zwischenzuspeichern.

## Vorteile

- Reduzierung externer API-Aufrufe
- Schnellere Antwortzeiten
- Geringere Last auf der Wetter-API
- Verbesserte Performance

---

# 🔧 Konfigurationsbeispiele

## Nginx Reverse Proxy

```nginx
location /api/ {
    proxy_pass https://backend-url/api/;
}
```

Dieser Reverse Proxy leitet API-Anfragen automatisch vom Frontend an das Backend weiter.

---

## Health Endpoint

```js
app.get("/health", async (req, res) => {
  await redis.ping();
  res.status(200).json({ status: "healthy" });
});
```

Der Endpoint dient zur Überwachung der Verfügbarkeit des Backends und der Redis-Verbindung.

---

# 🔐 Environment Variables

Sensitive Daten werden nicht im Repository gespeichert.

Verwendete Variablen:

```text
REDIS_URL
CACHE_TTL_SECONDS
VITE_API_BASE_URL
PORT
```

Alle Variablen werden direkt in Railway verwaltet.

---

# 🩺 Health Checks

Das Backend besitzt einen eigenen Health-Endpoint:

```text
/health
```

Dieser wird verwendet für:

- Service-Monitoring
- Verfügbarkeitsprüfung
- Railway Deployment Checks
- Redis-Verbindungsprüfung

---

# 📂 Projektstruktur

```text
backend/
src/
public/

Dockerfile
docker-compose.yml
nginx.conf

README.md
package.json
```

---

# ⚙️ Reproduzierbare Setup-Schritte

## Repository klonen

```bash
git clone https://github.com/gh1355/DEP-Challenges.git
```

## Dependencies installieren

```bash
npm install
```

## Docker Deployment lokal starten

```bash
docker compose up --build
```

## Railway Deployment

1. GitHub Repository mit Railway verbinden
2. Frontend-, Backend- und Redis-Service erstellen
3. Environment Variables konfigurieren
4. Deployment starten
5. Öffentliche URL testen

---

# 🧠 Architektur-Entscheidungen

## Warum Railway?

Railway ermöglicht schnelle und einfache Cloud-Deployments mit automatischer GitHub-Integration und guter Unterstützung für Docker-Projekte.

## Warum Redis?

Redis reduziert externe API-Aufrufe und verbessert die Performance der Anwendung.

## Warum Nginx?

Nginx dient als Reverse Proxy und liefert die React SPA effizient aus.

## Warum Docker?

Docker ermöglicht reproduzierbare und portable Deployments.

## Warum Open-Meteo?

Open-Meteo wurde gewählt, da die API kostenlos nutzbar ist und aktuelle Wetterdaten ohne komplexe Authentifizierung bereitstellt.

---

# 🧠 Reflexion

Während der Umsetzung von C3 habe ich gelernt:

- Aufbau cloudbasierter Deployments
- Nutzung von Railway
- Deployment mehrerer Services
- Verwaltung von Environment Variables
- Nutzung von Redis in der Cloud
- Arbeiten mit Health Checks
- Troubleshooting von Cloud Deployments
- Verwaltung produktionsnaher Infrastruktur

Besonders hilfreich war die Kombination aus:

- Docker
- GitHub
- Railway
- Redis

Dadurch konnte ein realistisches Cloud-Deployment umgesetzt werden.

---

# ⚠️ Bekannte Einschränkungen

Einige zusätzliche Wetterwerte wie Luftfeuchtigkeit, Druck oder Sichtbarkeit werden aktuell nur teilweise unterstützt, da die verwendete Wetter-API diese Werte nicht vollständig im aktuellen Wetterobjekt bereitstellt.

Die Kernfunktionen der Anwendung funktionieren jedoch vollständig.

---

# 📜 KI-Unterstützung

Für die Erstellung einzelner Konfigurationen, Deployment-Setups sowie zur Unterstützung beim Troubleshooting wurden KI-Tools verwendet.

Alle verwendeten Konfigurationen und Deployments wurden verstanden, angepasst und eigenständig getestet.

---

# 📜 Lizenz

Dieses Projekt wurde im Rahmen des Moduls WEB2 / DEP an der GIBB Bern erstellt.
