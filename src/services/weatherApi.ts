import type {
  ForecastDay,
  HourlyForecast,
  WeatherData,
} from "../types/weather";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function getCurrentWeather(
  city: string,
  units: string = "metric",
): Promise<WeatherData> {
  const response = await fetch(
    `${BACKEND_URL}/api/weather?city=${encodeURIComponent(city)}&units=${units}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Fehler beim Laden der Wetterdaten");
  }

  return data;
}

export async function getWeatherByCoords(
  lat: number,
  lon: number,
  units: string = "metric",
): Promise<WeatherData> {
  const response = await fetch(
    `${BACKEND_URL}/api/weather/coords?lat=${lat}&lon=${lon}&units=${units}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Fehler beim Laden der Wetterdaten");
  }

  return data;
}

export async function getForecast(
  city: string,
  units: string = "metric",
): Promise<ForecastDay[]> {
  const response = await fetch(
    `${BACKEND_URL}/api/forecast?city=${encodeURIComponent(city)}&units=${units}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Fehler beim Laden der Vorhersage");
  }

  return data;
}

export async function getHourlyForecast(
  city: string,
  units: string = "metric",
): Promise<HourlyForecast[]> {
  const response = await fetch(
    `${BACKEND_URL}/api/hourly?city=${encodeURIComponent(city)}&units=${units}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Fehler beim Laden der Vorhersage");
  }

  return data;
}

export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}