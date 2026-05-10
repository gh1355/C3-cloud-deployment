import { AlertTriangle } from "lucide-react";
import { useWeatherStore } from "../store/weatherStore";

/**
 * ErrorMessage-Komponente zeigt Fehlermeldungen an.
 * Wiederverwendbar mit automatischer Schliessfunktion.
 */
function ErrorMessage() {
  const { error, clearError } = useWeatherStore();

  if (!error) return null;

  return (
    <div className="error-message" role="alert" aria-live="assertive">
      <AlertTriangle size={20} aria-hidden="true" />
      <span>{error}</span>
      <button
        className="error-close"
        onClick={clearError}
        aria-label="Fehlermeldung schliessen"
      >
        &times;
      </button>
    </div>
  );
}

export default ErrorMessage;
