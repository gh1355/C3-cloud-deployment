import {
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Heart,
  HeartOff,
  Thermometer,
  Cloud,
} from "lucide-react";
import { useWeatherStore } from "../store/weatherStore";
import { getWeatherIconUrl } from "../services/weatherApi";

/**
 * WeatherCard-Komponente zeigt die aktuellen Wetterdaten einer Stadt.
 * Enthaelt alle wichtigen Informationen und eine Favoriten-Funktion.
 */
function WeatherCard() {
  const { currentWeather, unit, isFavorite, addFavorite, removeFavorite } =
    useWeatherStore();

  if (!currentWeather) return null;

  const unitSymbol = unit === "metric" ? "°C" : "°F";
  const windUnit = unit === "metric" ? "m/s" : "mph";
  const favorite = isFavorite(currentWeather.city);

  // Sonnenaufgang / Sonnenuntergang formatieren
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString("de-CH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Favoriten-Status umschalten
  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(currentWeather.city);
    } else {
      addFavorite(currentWeather.city, currentWeather.country);
    }
  };

  return (
    <div className="weather-card animate-fade-in">
      <div className="weather-card-header">
        <div className="weather-card-location">
          <h2>
            {currentWeather.city}, {currentWeather.country}
          </h2>
          <p className="weather-date">
            {new Date(currentWeather.dt * 1000).toLocaleDateString("de-CH", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          className={`btn-favorite ${favorite ? "active" : ""}`}
          onClick={toggleFavorite}
          aria-label={favorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufuegen"}
          title={favorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufuegen"}
        >
          {favorite ? <Heart size={24} fill="currentColor" /> : <HeartOff size={24} />}
        </button>
      </div>

      <div className="weather-card-main">
        <div className="weather-temp-section">
          <img
            src={getWeatherIconUrl(currentWeather.icon)}
            alt={currentWeather.description}
            className="weather-icon-large"
            width={100}
            height={100}
          />
          <div className="weather-temp">
            <span className="temp-value">{currentWeather.temperature}</span>
            <span className="temp-unit">{unitSymbol}</span>
          </div>
          <p className="weather-description">{currentWeather.description}</p>
        </div>

        <div className="weather-details-grid">
          <div className="weather-detail" title="Gefuehlte Temperatur">
            <Thermometer size={20} aria-hidden="true" />
            <span className="detail-label">Gefuehlt</span>
            <span className="detail-value">
              {currentWeather.feelsLike}
              {unitSymbol}
            </span>
          </div>

          <div className="weather-detail" title="Luftfeuchtigkeit">
            <Droplets size={20} aria-hidden="true" />
            <span className="detail-label">Feuchtigkeit</span>
            <span className="detail-value">{currentWeather.humidity}%</span>
          </div>

          <div className="weather-detail" title="Windgeschwindigkeit">
            <Wind size={20} aria-hidden="true" />
            <span className="detail-label">Wind</span>
            <span className="detail-value">
              {currentWeather.windSpeed} {windUnit}
            </span>
          </div>

          <div className="weather-detail" title="Sichtweite">
            <Eye size={20} aria-hidden="true" />
            <span className="detail-label">Sicht</span>
            <span className="detail-value">
              {(currentWeather.visibility / 1000).toFixed(1)} km
            </span>
          </div>

          <div className="weather-detail" title="Luftdruck">
            <Gauge size={20} aria-hidden="true" />
            <span className="detail-label">Druck</span>
            <span className="detail-value">{currentWeather.pressure} hPa</span>
          </div>

          <div className="weather-detail" title="Bewoelkung">
            <Cloud size={20} aria-hidden="true" />
            <span className="detail-label">Wolken</span>
            <span className="detail-value">{currentWeather.clouds}%</span>
          </div>

          <div className="weather-detail" title="Sonnenaufgang">
            <Sunrise size={20} aria-hidden="true" />
            <span className="detail-label">Aufgang</span>
            <span className="detail-value">{formatTime(currentWeather.sunrise)}</span>
          </div>

          <div className="weather-detail" title="Sonnenuntergang">
            <Sunset size={20} aria-hidden="true" />
            <span className="detail-label">Untergang</span>
            <span className="detail-value">{formatTime(currentWeather.sunset)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;
