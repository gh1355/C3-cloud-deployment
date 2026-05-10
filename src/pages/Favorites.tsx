import { useEffect } from "react";
import { Star } from "lucide-react";
import FavoritesList from "../components/FavoritesList";

/**
 * Favoriten-Seite: Zeigt alle gespeicherten Favoritenstaede.
 * Ermoeglicht das Laden und Entfernen von Favoriten.
 */
function Favorites() {
  useEffect(() => {
    document.title = "Favoriten – WeatherWise";
  }, []);

  return (
    <div className="page page-favorites">
      <div className="page-header">
        <Star size={28} aria-hidden="true" />
        <h1>Meine Favoriten</h1>
      </div>
      <p className="page-description">
        Hier finden Sie Ihre gespeicherten Städte. Klicken Sie auf
        &laquo;Wetter anzeigen&raquo;, um die aktuellen Daten abzurufen.
      </p>
      <FavoritesList />
    </div>
  );
}

export default Favorites;
