import { create } from "zustand";
import type {
  WeatherData,
  ForecastDay,
  HourlyForecast,
  FavoriteCity,
  TemperatureUnit,
} from "../types/weather";
import {
  getCurrentWeather,
  getForecast,
  getHourlyForecast,
  getWeatherByCoords,
} from "../services/weatherApi";

// Favoriten aus dem LocalStorage laden
function loadFavorites(): FavoriteCity[] {
  try {
    const stored = localStorage.getItem("weatherwise-favorites");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Favoriten im LocalStorage speichern
function saveFavorites(favorites: FavoriteCity[]): void {
  localStorage.setItem("weatherwise-favorites", JSON.stringify(favorites));
}

// Letzte gesuchte Stadt aus dem LocalStorage laden
function loadLastCity(): string {
  return localStorage.getItem("weatherwise-last-city") || "";
}

// Letzte gesuchte Stadt im LocalStorage speichern
function saveLastCity(city: string): void {
  localStorage.setItem("weatherwise-last-city", city);
}

// Einheit aus dem LocalStorage laden
function loadUnit(): TemperatureUnit {
  return (localStorage.getItem("weatherwise-unit") as TemperatureUnit) || "metric";
}

// Einheit im LocalStorage speichern
function saveUnit(unit: TemperatureUnit): void {
  localStorage.setItem("weatherwise-unit", unit);
}

// Interface für den globalen Zustand der App
interface WeatherState {
  // Wetterdaten
  currentWeather: WeatherData | null;
  forecast: ForecastDay[];
  hourlyForecast: HourlyForecast[];

  // UI-Zustand
  loading: boolean;
  error: string;
  searchQuery: string;
  unit: TemperatureUnit;

  // Favoriten
  favorites: FavoriteCity[];

  // Aktionen
  searchCity: (city: string) => Promise<void>;
  searchByCoords: (lat: number, lon: number) => Promise<void>;
  setUnit: (unit: TemperatureUnit) => void;
  addFavorite: (city: string, country: string) => void;
  removeFavorite: (city: string) => void;
  isFavorite: (city: string) => boolean;
  getLastCity: () => string;
  clearError: () => void;
}

// Zustand-Store für globales State-Management
export const useWeatherStore = create<WeatherState>((set, get) => ({
  currentWeather: null,
  forecast: [],
  hourlyForecast: [],
  loading: false,
  error: "",
  searchQuery: "",
  unit: loadUnit(),
  favorites: loadFavorites(),

  // Stadt suchen und alle Wetterdaten laden
  searchCity: async (city: string) => {
    try {
      set({ loading: true, error: "", searchQuery: city });

      const unit = get().unit;
      const [weatherData, forecastData, hourlyData] = await Promise.all([
        getCurrentWeather(city, unit),
        getForecast(city, unit),
        getHourlyForecast(city, unit),
      ]);

      set({
        currentWeather: weatherData,
        forecast: forecastData,
        hourlyForecast: hourlyData,
      });

      saveLastCity(city);
    } catch (err) {
      set({
        currentWeather: null,
        forecast: [],
        hourlyForecast: [],
        error: err instanceof Error ? err.message : "Unbekannter Fehler",
      });
    } finally {
      set({ loading: false });
    }
  },

  // Wetter anhand von Geokoordinaten laden
  searchByCoords: async (lat: number, lon: number) => {
    try {
      set({ loading: true, error: "" });

      const unit = get().unit;
      const weatherData = await getWeatherByCoords(lat, lon, unit);

      // Nach Ermittlung des Stadtnamens die restlichen Daten laden
      const cityName = weatherData.city;
      const [forecastData, hourlyData] = await Promise.all([
        getForecast(cityName, unit),
        getHourlyForecast(cityName, unit),
      ]);

      set({
        currentWeather: weatherData,
        forecast: forecastData,
        hourlyForecast: hourlyData,
        searchQuery: cityName,
      });

      saveLastCity(cityName);
    } catch (err) {
      set({
        currentWeather: null,
        forecast: [],
        hourlyForecast: [],
        error: err instanceof Error ? err.message : "Standort konnte nicht ermittelt werden",
      });
    } finally {
      set({ loading: false });
    }
  },

  // Temperatureinheit aendern und Daten neu laden
  setUnit: (unit: TemperatureUnit) => {
    saveUnit(unit);
    set({ unit });

    // Falls bereits eine Stadt geladen ist, Daten neu abrufen
    const currentCity = get().currentWeather?.city;
    if (currentCity) {
      get().searchCity(currentCity);
    }
  },

  // Stadt zu Favoriten hinzufuegen
  addFavorite: (city: string, country: string) => {
    const favorites = get().favorites;
    if (!favorites.some((f) => f.name.toLowerCase() === city.toLowerCase())) {
      const updated = [...favorites, { name: city, country, addedAt: Date.now() }];
      set({ favorites: updated });
      saveFavorites(updated);
    }
  },

  // Stadt aus Favoriten entfernen
  removeFavorite: (city: string) => {
    const updated = get().favorites.filter(
      (f) => f.name.toLowerCase() !== city.toLowerCase()
    );
    set({ favorites: updated });
    saveFavorites(updated);
  },

  // Pruefen ob eine Stadt in Favoriten ist
  isFavorite: (city: string) => {
    return get().favorites.some(
      (f) => f.name.toLowerCase() === city.toLowerCase()
    );
  },

  // Letzte gesuchte Stadt abrufen
  getLastCity: () => loadLastCity(),

  // Fehlermeldung zuruecksetzen
  clearError: () => set({ error: "" }),
}));
