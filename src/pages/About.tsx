import { useEffect } from "react";
import { Info, Users, Code, Database, Globe } from "lucide-react";

/**
 * Info-Seite: Zeigt Informationen ueber das Projekt und die Technologien.
 */
function About() {
  useEffect(() => {
    document.title = "Info – WeatherWise";
  }, []);

  return (
    <div className="page page-about">
      <div className="page-header">
        <Info size={28} aria-hidden="true" />
        <h1>Über WeatherWise</h1>
      </div>

      <section className="about-section">
        <h2>
          <Globe size={22} aria-hidden="true" />
          Projektbeschreibung
        </h2>
        <p>
          WeatherWise ist eine moderne Wetter-Web-Applikation, die im Rahmen des
          WEB2-Moduls an der GIBB Bern entwickelt wurde. Die App ermoeglicht es
          Benutzern, aktuelle Wetterdaten und Vorhersagen für beliebige Städte
          weltweit abzurufen.
        </p>
        <p>
          Das Projekt wurde als Single Page Application (SPA) mit React und
          TypeScript umgesetzt und nutzt die OpenWeatherMap API für zuverlaessige
          Wetterdaten.
        </p>
      </section>

      <section className="about-section">
        <h2>
          <Users size={22} aria-hidden="true" />
          Team
        </h2>
        <div className="team-grid">
          <div className="team-card">
            <div className="team-avatar">OG</div>
            <h3>Oguzhan Saydam</h3>
            <p>Frontend-Entwicklung & Design</p>
          </div>
          <div className="team-card">
            <div className="team-avatar">GA</div>
            <h3>Gholamreza Aghakhani</h3>
            <p>API-Integration & State-Management</p>
          </div>
          <div className="team-card">
            <div className="team-avatar">MA</div>
            <h3>Mehmet Ali Gür</h3>
            <p>Routing, Favoriten & Testing</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>
          <Code size={22} aria-hidden="true" />
          Technologien
        </h2>
        <div className="tech-grid">
          <div className="tech-card">
            <h3>React 19</h3>
            <p>Komponentenbasierte UI-Bibliothek</p>
          </div>
          <div className="tech-card">
            <h3>TypeScript</h3>
            <p>Typsichere Programmierung</p>
          </div>
          <div className="tech-card">
            <h3>Vite</h3>
            <p>Schnelles Build-Tool und Dev-Server</p>
          </div>
          <div className="tech-card">
            <h3>React Router</h3>
            <p>Client-seitiges Routing (SPA)</p>
          </div>
          <div className="tech-card">
            <h3>Zustand</h3>
            <p>Leichtgewichtiges State-Management</p>
          </div>
          <div className="tech-card">
            <h3>Lucide React</h3>
            <p>Moderne Icon-Bibliothek</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>
          <Database size={22} aria-hidden="true" />
          Datenquelle
        </h2>
        <p>
          Alle Wetterdaten werden von der{" "}
          <a
            href="https://openweathermap.org/api"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenWeatherMap API
          </a>{" "}
          bezogen. Die API bietet aktuelle Wetterdaten, 5-Tage-Vorhersagen und
          stuendliche Prognosen für ueber 200'000 Städte weltweit.
        </p>
      </section>
    </div>
  );
}

export default About;
