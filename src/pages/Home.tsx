import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CloudSun, Search, Star, Thermometer, MapPin } from "lucide-react";
import SearchBar from "../components/SearchBar";
import { useWeatherStore } from "../store/weatherStore";

/**
 * Home-Seite mit Hero-Bereich, Suchfunktion und Feature-Übersicht.
 * Laedt bei Vorhandensein der letzten Suche automatisch weiter.
 */
function Home() {
  const { favorites, searchCity } = useWeatherStore();
  const navigate = useNavigate();

  // Schnellzugriff auf eine Favoritenstadt
  const handleQuickLoad = async (cityName: string) => {
    await searchCity(cityName);
    navigate("/wetter");
  };

  // Dokumenttitel setzen
  useEffect(() => {
    document.title = "WeatherWise – Startseite";
  }, []);

  return (
    <div className="page page-home">
      {/* Hero-Bereich */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-content">
          <div className="hero-icon-wrapper">
            <CloudSun size={64} className="hero-icon" aria-hidden="true" />
          </div>
          <h1 id="hero-title">WeatherWise</h1>
          <p className="hero-subtitle">
            Aktuelle Wetterdaten und Vorhersagen für jede Stadt weltweit.
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Schnellzugriff auf Favoriten */}
      {favorites.length > 0 && (
        <section className="quick-favorites" aria-label="Schnellzugriff Favoriten">
          <h2 className="section-title">
            <Star size={20} aria-hidden="true" />
            Ihre Favoriten
          </h2>
          <div className="quick-favorites-grid">
            {favorites.slice(0, 4).map((fav) => (
              <button
                key={fav.name}
                className="quick-fav-card"
                onClick={() => handleQuickLoad(fav.name)}
                aria-label={`Wetter für ${fav.name} laden`}
              >
                <MapPin size={18} aria-hidden="true" />
                <span className="quick-fav-name">{fav.name}</span>
                <span className="quick-fav-country">{fav.country}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Feature-Karten */}
      <section className="features" aria-label="Funktionen">
        <h2 className="section-title">Funktionen</h2>
        <div className="features-grid">
          <div className="feature-card">
            <Search size={32} aria-hidden="true" />
            <h3>Stadtsuche</h3>
            <p>
              Suchen Sie nach einer beliebigen Stadt oder nutzen Sie die
              Geolokalisierung für den aktuellen Standort.
            </p>
          </div>
          <div className="feature-card">
            <CloudSun size={32} aria-hidden="true" />
            <h3>5-Tage-Vorhersage</h3>
            <p>
              Sehen Sie detaillierte Wettervorhersagen für die naechsten
              5 Tage inklusive stuendlicher Prognose.
            </p>
          </div>
          <div className="feature-card">
            <Star size={32} aria-hidden="true" />
            <h3>Favoriten</h3>
            <p>
              Speichern Sie Ihre Lieblingsstaede und rufen Sie das Wetter
              mit einem Klick ab.
            </p>
          </div>
          <div className="feature-card">
            <Thermometer size={32} aria-hidden="true" />
            <h3>Einheiten</h3>
            <p>
              Wechseln Sie jederzeit zwischen Celsius und Fahrenheit
              für die Temperaturanzeige.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
