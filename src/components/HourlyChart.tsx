import { useWeatherStore } from "../store/weatherStore";
import { getWeatherIconUrl } from "../services/weatherApi";
import { Clock } from "lucide-react";

/**
 * HourlyChart-Komponente zeigt die stuendliche Vorhersage (naechste 24h).
 * Dargestellt als horizontale Kartenreihe mit Scroll-Funktion.
 */
function HourlyChart() {
  const { hourlyForecast, unit } = useWeatherStore();

  if (hourlyForecast.length === 0) return null;

  const unitSymbol = unit === "metric" ? "°C" : "°F";

  // Uhrzeit formatieren
  const formatHour = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("de-CH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="hourly-section animate-fade-in">
      <h3 className="section-title">
        <Clock size={20} aria-hidden="true" />
        Naechste 24 Stunden
      </h3>
      <div className="hourly-scroll" role="list" aria-label="Stuendliche Vorhersage">
        {hourlyForecast.map((hour, index) => (
          <div key={index} className="hourly-item" role="listitem">
            <span className="hourly-time">{formatHour(hour.time)}</span>
            <img
              src={getWeatherIconUrl(hour.icon)}
              alt={hour.description}
              className="hourly-icon"
              width={44}
              height={44}
            />
            <span className="hourly-temp">
              {hour.temperature}
              {unitSymbol}
            </span>
            {hour.pop > 0 && (
              <span className="hourly-rain" title="Niederschlagswahrscheinlichkeit">
                {hour.pop}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HourlyChart;
