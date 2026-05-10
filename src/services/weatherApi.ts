import type {
  ForecastDay,
  HourlyForecast,
  WeatherData,
} from "../types/weather";

// OpenWeatherMap wird weiterhin für Forecast-Funktionen verwendet.
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Backend-URL für Cloud Deployment.
// Lokal mit Docker Compose bleibt der Wert leer und Nginx leitet /api weiter.
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Holt die aktuellen Wetterdaten über das eigene Backend.
 * Dadurch läuft die Hauptfunktion der App über Backend + Redis Cache.
 * @param city - Name der Stadt
 */
export async function getCurrentWeather(
  city: string,
  units: string = "metric",
): Promise<WeatherData> {
  const response = await fetch(
    `${BACKEND_URL}/api/weather?city=${encodeURIComponent(city)}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Fehler beim Laden der Wetterdaten");
  }

  return {
    city: data.city,
    country: data.country,
    temperature: Math.round(data.current_weather.temperature),
    feelsLike: Math.round(data.current_weather.temperature),
    description: `Wettercode ${data.current_weather.weathercode}`,
    icon: "01d",
    humidity: 0,
    windSpeed: data.current_weather.windspeed,
    windDeg: data.current_weather.winddirection ?? 0,
    pressure: 0,
    visibility: 0,
    clouds: 0,
    sunrise: 0,
    sunset: 0,
    lat: data.latitude,
    lon: data.longitude,
    dt: Math.floor(new Date(data.current_weather.time).getTime() / 1000),
  };
}

/**
 * Holt die aktuellen Wetterdaten anhand von Geokoordinaten.
 * @param lat - Breitengrad
 * @param lon - Laengengrad
 * @param units - Einheit (metric oder imperial)
 */
export async function getWeatherByCoords(
  lat: number,
  lon: number,
  units: string = "metric",
): Promise<WeatherData> {
  const response = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}&lang=de`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Fehler beim Laden der Wetterdaten");
  }

  return {
    city: data.name,
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    windDeg: data.wind.deg ?? 0,
    pressure: data.main.pressure,
    visibility: data.visibility,
    clouds: data.clouds.all,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    lat: data.coord.lat,
    lon: data.coord.lon,
    dt: data.dt,
  };
}

/**
 * Holt die 5-Tage-Vorhersage für eine Stadt.
 * @param city - Name der Stadt
 * @param units - Einheit (metric oder imperial)
 */
export async function getForecast(
  city: string,
  units: string = "metric",
): Promise<ForecastDay[]> {
  const response = await fetch(
    `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}&lang=de`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Fehler beim Laden der Vorhersage");
  }

  const forecastList = data.list
    .filter((item: { dt_txt: string }) => item.dt_txt.includes("12:00:00"))
    .slice(0, 5);

  return forecastList.map(
    (item: {
      dt_txt: string;
      main: {
        temp: number;
        temp_min: number;
        temp_max: number;
        humidity: number;
      };
      weather: { description: string; icon: string }[];
      wind: { speed: number };
      pop: number;
    }) => ({
      date: item.dt_txt,
      tempMin: Math.round(item.main.temp_min),
      tempMax: Math.round(item.main.temp_max),
      temperature: Math.round(item.main.temp),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
      pop: Math.round(item.pop * 100),
    }),
  );
}

/**
 * Holt die stuendliche Vorhersage (naechste 24 Stunden).
 * @param city - Name der Stadt
 * @param units - Einheit (metric oder imperial)
 */
export async function getHourlyForecast(
  city: string,
  units: string = "metric",
): Promise<HourlyForecast[]> {
  const response = await fetch(
    `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}&lang=de`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Fehler beim Laden der Vorhersage");
  }

  return data.list
    .slice(0, 8)
    .map(
      (item: {
        dt_txt: string;
        main: { temp: number };
        weather: { description: string; icon: string }[];
        pop: number;
      }) => ({
        time: item.dt_txt,
        temperature: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        pop: Math.round(item.pop * 100),
      }),
    );
}

/**
 * Gibt die URL für ein Wettericon zurueck.
 * @param iconCode - Icon-Code von OpenWeatherMap
 */
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
