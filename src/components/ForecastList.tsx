import { useWeatherStore } from "../store/weatherStore";
import { getWeatherIconUrl } from "../services/weatherApi";
import { Droplets, Wind } from "lucide-react";

/**
 * ForecastList-Komponente zeigt die 5-Tage-Vorhersage als Kartenreihe.
 */
function ForecastList() {
  const { forecast, unit } = useWeatherStore();

  if (forecast.length === 0) return null;

  const unitSymbol = unit === "metric" ? "°C" : "°F";

  // Wochentag aus Datumsstring ermitteln
  const getWeekday = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("de-CH", { weekday: "short" });
  };

  // Kurzes Datum formatieren
  const getShortDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("de-CH", { day: "numeric", month: "short" });
  };

  return (
    <div className="forecast-section animate-fade-in">
      <h3 className="section-title">5-Tage-Vorhersage</h3>
      <div className="forecast-grid">
        {forecast.map((day) => (
          <div key={day.date} className="forecast-card">
            <p className="forecast-weekday">{getWeekday(day.date)}</p>
            <p className="forecast-date">{getShortDate(day.date)}</p>
            <img
              src={getWeatherIconUrl(day.icon)}
              alt={day.description}
              className="forecast-icon"
              width={60}
              height={60}
            />
            <div className="forecast-temps">
              <span className="temp-high">
                {day.tempMax}
                {unitSymbol}
              </span>
              <span className="temp-low">
                {day.tempMin}
                {unitSymbol}
              </span>
            </div>
            <p className="forecast-desc">{day.description}</p>
            <div className="forecast-meta">
              <span title="Niederschlag">
                <Droplets size={14} /> {day.pop}%
              </span>
              <span title="Wind">
                <Wind size={14} /> {day.windSpeed.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ForecastList;
