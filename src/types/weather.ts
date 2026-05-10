// Dieses Interface beschreibt die aktuellen Wetterdaten einer Stadt
export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  pressure: number;
  visibility: number;
  clouds: number;
  sunrise: number;
  sunset: number;
  lat: number;
  lon: number;
  dt: number;
}

// Dieses Interface beschreibt die Vorhersage für einen Tag
export interface ForecastDay {
  date: string;
  tempMin: number;
  tempMax: number;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  pop: number;
}

// Dieses Interface beschreibt einen stuendlichen Vorhersage-Eintrag
export interface HourlyForecast {
  time: string;
  temperature: number;
  description: string;
  icon: string;
  pop: number;
}

// Dieses Interface beschreibt eine gespeicherte Favoritenstadt
export interface FavoriteCity {
  name: string;
  country: string;
  addedAt: number;
}

// Einheiten-Typ für Temperaturanzeige
export type TemperatureUnit = "metric" | "imperial";
