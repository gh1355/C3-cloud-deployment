import { useEffect } from "react";
import SearchBar from "../components/SearchBar";
import WeatherCard from "../components/WeatherCard";
import ForecastList from "../components/ForecastList";
import HourlyChart from "../components/HourlyChart";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { useWeatherStore } from "../store/weatherStore";
import { CloudOff } from "lucide-react";

/**
 * Wetter-Seite: Zeigt alle Wetterdaten für die gesuchte Stadt.
 * Enthaelt aktuelle Daten, stuendliche und 5-Tage-Vorhersage.
 */
function Weather() {
  const { currentWeather, loading, error } = useWeatherStore();

  // Dokumenttitel aktualisieren
  useEffect(() => {
    if (currentWeather) {
      document.title = `Wetter in ${currentWeather.city} – WeatherWise`;
    } else {
      document.title = "Wetter – WeatherWise";
    }
  }, [currentWeather]);

  return (
    <div className="page page-weather">
      <div className="weather-search-section">
        <h1>Wetter abfragen</h1>
        <SearchBar />
      </div>

      <ErrorMessage />

      {loading && <LoadingSpinner message="Wetterdaten werden geladen..." />}

      {!loading && !currentWeather && !error && (
        <div className="weather-empty">
          <CloudOff size={64} className="empty-icon" aria-hidden="true" />
          <h2>Keine Wetterdaten</h2>
          <p>Suchen Sie nach einer Stadt, um das aktuelle Wetter anzuzeigen.</p>
        </div>
      )}

      {!loading && currentWeather && (
        <div className="weather-results animate-fade-in">
          <WeatherCard />
          <HourlyChart />
          <ForecastList />
        </div>
      )}
    </div>
  );
}

export default Weather;
