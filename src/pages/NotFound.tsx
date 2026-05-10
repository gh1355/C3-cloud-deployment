import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CloudOff, Home } from "lucide-react";

/**
 * NotFound-Seite: Wird bei unbekannten Routes angezeigt (404).
 */
function NotFound() {
  useEffect(() => {
    document.title = "404 – Seite nicht gefunden – WeatherWise";
  }, []);

  return (
    <div className="page page-not-found">
      <CloudOff size={80} className="not-found-icon" aria-hidden="true" />
      <h1>404</h1>
      <h2>Seite nicht gefunden</h2>
      <p>Die angeforderte Seite existiert leider nicht.</p>
      <Link to="/" className="btn btn-primary">
        <Home size={18} aria-hidden="true" />
        Zurueck zur Startseite
      </Link>
    </div>
  );
}

export default NotFound;
