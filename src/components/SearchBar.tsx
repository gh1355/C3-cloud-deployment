import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { useWeatherStore } from "../store/weatherStore";

/**
 * SearchBar-Komponente für die Stadtsuche.
 * Unterstuetzt manuelle Eingabe und Geolokalisierung.
 */
function SearchBar() {
  const [city, setCity] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const navigate = useNavigate();
  const { searchCity, searchByCoords } = useWeatherStore();

  // Suchformular absenden
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!city.trim()) return;

    await searchCity(city.trim());
    navigate("/wetter");
    setCity("");
  };

  // Aktuellen Standort verwenden
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolokalisierung wird von Ihrem Browser nicht unterstuetzt.");
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await searchByCoords(position.coords.latitude, position.coords.longitude);
        setGeoLoading(false);
        navigate("/wetter");
      },
      () => {
        setGeoLoading(false);
        alert("Standort konnte nicht ermittelt werden. Bitte erlauben Sie den Zugriff.");
      }
    );
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-form" role="search">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} aria-hidden="true" />
          <input
            type="text"
            placeholder="Stadt eingeben..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="search-input"
            aria-label="Stadt eingeben"
          />
        </div>
        <button type="submit" className="btn btn-primary" aria-label="Suchen">
          Suchen
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleGeolocation}
          disabled={geoLoading}
          aria-label="Aktuellen Standort verwenden"
          title="Aktuellen Standort verwenden"
        >
          <MapPin size={18} />
          {geoLoading ? "..." : "Standort"}
        </button>
      </form>
    </div>
  );
}

export default SearchBar;
