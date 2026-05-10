import { useWeatherStore } from "../store/weatherStore";

/**
 * UnitToggle-Komponente ermoeglicht das Umschalten zwischen Celsius und Fahrenheit.
 * Wird in der Navigation und auf der Einstellungsseite verwendet (Wiederverwendbare Komponente).
 */
function UnitToggle() {
  const { unit, setUnit } = useWeatherStore();

  return (
    <div className="unit-toggle" role="radiogroup" aria-label="Temperatureinheit waehlen">
      <button
        className={`unit-btn ${unit === "metric" ? "active" : ""}`}
        onClick={() => setUnit("metric")}
        role="radio"
        aria-checked={unit === "metric"}
        aria-label="Celsius"
      >
        °C
      </button>
      <button
        className={`unit-btn ${unit === "imperial" ? "active" : ""}`}
        onClick={() => setUnit("imperial")}
        role="radio"
        aria-checked={unit === "imperial"}
        aria-label="Fahrenheit"
      >
        °F
      </button>
    </div>
  );
}

export default UnitToggle;
