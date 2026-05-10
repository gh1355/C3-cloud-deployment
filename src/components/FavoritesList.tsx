import { useNavigate } from "react-router-dom";
import { Star, Trash2, CloudSun } from "lucide-react";
import { useWeatherStore } from "../store/weatherStore";

/**
 * FavoritesList-Komponente zeigt die gespeicherten Favoritenstaede.
 * Ermoeglicht schnelles Laden von Wetterdaten und Entfernen von Eintraegen.
 */
function FavoritesList() {
  const { favorites, removeFavorite, searchCity } = useWeatherStore();
  const navigate = useNavigate();

  // Favoritenstadt laden und zur Wetterseite navigieren
  const handleLoadCity = async (cityName: string) => {
    await searchCity(cityName);
    navigate("/wetter");
  };

  if (favorites.length === 0) {
    return (
      <div className="favorites-empty">
        <Star size={48} className="empty-icon" aria-hidden="true" />
        <p>Noch keine Favoriten gespeichert.</p>
        <p className="empty-hint">
          Suchen Sie nach einer Stadt und klicken Sie auf das Herz-Symbol,
          um sie als Favorit zu speichern.
        </p>
      </div>
    );
  }

  return (
    <div className="favorites-list">
      {favorites.map((fav) => (
        <div key={fav.name} className="favorite-item">
          <div className="favorite-info">
            <CloudSun size={22} className="favorite-icon" aria-hidden="true" />
            <div>
              <span className="favorite-name">{fav.name}</span>
              <span className="favorite-country">{fav.country}</span>
            </div>
          </div>
          <div className="favorite-actions">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleLoadCity(fav.name)}
              aria-label={`Wetter für ${fav.name} laden`}
            >
              Wetter anzeigen
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => removeFavorite(fav.name)}
              aria-label={`${fav.name} aus Favoriten entfernen`}
              title="Entfernen"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FavoritesList;
