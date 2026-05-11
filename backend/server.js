import express from "express";
import cors from "cors";
import axios from "axios";
import { createClient } from "redis";

const app = express();

const PORT = process.env.PORT || 3000;
const REDIS_URL =
  process.env.REDIS_URL || "redis://redis.railway.internal:6379";
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 300);

app.use(cors());
app.use(express.json());

function log(level, message, meta = {}) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    }),
  );
}

const redis = createClient({ url: REDIS_URL });

redis.on("error", (err) => {
  log("error", "Redis connection error", { error: err.message });
});

try {
  await redis.connect();
  log("info", "Connected to Redis");
} catch (error) {
  log("error", "Could not connect to Redis", { error: error.message });
}

function getWeatherDescription(code) {
  const descriptions = {
    0: "Klarer Himmel",
    1: "Überwiegend klar",
    2: "Teilweise bewölkt",
    3: "Bewölkt",
    45: "Nebel",
    48: "Reifnebel",
    51: "Leichter Nieselregen",
    53: "Mäßiger Nieselregen",
    55: "Starker Nieselregen",
    61: "Leichter Regen",
    63: "Mäßiger Regen",
    65: "Starker Regen",
    71: "Leichter Schneefall",
    73: "Mäßiger Schneefall",
    75: "Starker Schneefall",
    80: "Leichte Regenschauer",
    81: "Mäßige Regenschauer",
    82: "Starke Regenschauer",
    95: "Gewitter",
  };

  return descriptions[code] || `Wettercode ${code}`;
}

function getWeatherIcon(code) {
  if (code === 0) return "01d";
  if ([1, 2].includes(code)) return "02d";
  if (code === 3) return "03d";
  if ([45, 48].includes(code)) return "50d";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "10d";
  if ([71, 73, 75].includes(code)) return "13d";
  if ([95].includes(code)) return "11d";

  return "01d";
}

async function getLocationByCity(city) {
  const geoResponse = await axios.get(
    "https://geocoding-api.open-meteo.com/v1/search",
    {
      params: {
        name: city,
        count: 1,
        language: "en",
        format: "json",
      },
    },
  );

  return geoResponse.data.results?.[0];
}

function mapCurrentWeather(location, currentWeather) {
  const weatherCode = currentWeather.weathercode;

  return {
    city: location.name,
    country: location.country,
    temperature: Math.round(currentWeather.temperature),
    feelsLike: Math.round(currentWeather.temperature),
    description: getWeatherDescription(weatherCode),
    icon: getWeatherIcon(weatherCode),
    humidity: 0,
    windSpeed: currentWeather.windspeed,
    windDeg: currentWeather.winddirection ?? 0,
    pressure: 0,
    visibility: 0,
    clouds: 0,
    sunrise: 0,
    sunset: 0,
    lat: location.latitude,
    lon: location.longitude,
    dt: Math.floor(new Date(currentWeather.time).getTime() / 1000),
  };
}

app.get("/health", async (req, res) => {
  try {
    await redis.ping();

    res.status(200).json({
      status: "healthy",
      redis: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "unhealthy",
      redis: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/api/weather", async (req, res) => {
  const city = String(req.query.city || "Zurich");
  const cacheKey = `weather:${city.toLowerCase()}`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      log("info", "Weather served from cache", { city });
      return res.json(JSON.parse(cached));
    }

    const location = await getLocationByCity(city);

    if (!location) {
      log("warn", "City not found", { city });
      return res.status(404).json({ error: "City not found" });
    }

    const weatherResponse = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          current_weather: true,
        },
      },
    );

    const result = mapCurrentWeather(
      location,
      weatherResponse.data.current_weather,
    );

    await redis.set(cacheKey, JSON.stringify(result), {
      EX: CACHE_TTL_SECONDS,
    });

    log("info", "Weather fetched from Open-Meteo", {
      city: location.name,
      cacheTtlSeconds: CACHE_TTL_SECONDS,
    });

    res.json(result);
  } catch (error) {
    log("error", "Weather request failed", {
      city,
      error: error.message,
    });

    res.status(500).json({ error: "Weather service failed" });
  }
});

app.get("/api/weather/coords", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  const cacheKey = `weather:coords:${lat}:${lon}`;

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      log("info", "Coordinate weather served from cache", { lat, lon });
      return res.json(JSON.parse(cached));
    }

    const weatherResponse = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude: lat,
          longitude: lon,
          current_weather: true,
        },
      },
    );

    const location = {
      name: "Aktueller Standort",
      country: "",
      latitude: lat,
      longitude: lon,
    };

    const result = mapCurrentWeather(
      location,
      weatherResponse.data.current_weather,
    );

    await redis.set(cacheKey, JSON.stringify(result), {
      EX: CACHE_TTL_SECONDS,
    });

    log("info", "Coordinate weather fetched from Open-Meteo", { lat, lon });

    res.json(result);
  } catch (error) {
    log("error", "Coordinate weather request failed", {
      lat,
      lon,
      error: error.message,
    });

    res.status(500).json({ error: "Weather service failed" });
  }
});

app.get("/api/forecast", async (req, res) => {
  const city = String(req.query.city || "Zurich");
  const cacheKey = `forecast:${city.toLowerCase()}`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      log("info", "Forecast served from cache", { city });
      return res.json(JSON.parse(cached));
    }

    const location = await getLocationByCity(city);

    if (!location) {
      log("warn", "City not found for forecast", { city });
      return res.status(404).json({ error: "City not found" });
    }

    const forecastResponse = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          daily:
            "temperature_2m_min,temperature_2m_max,weathercode,precipitation_probability_max,windspeed_10m_max",
          forecast_days: 5,
          timezone: "auto",
        },
      },
    );

    const daily = forecastResponse.data.daily;

    const result = daily.time.map((date, index) => ({
      date,
      tempMin: Math.round(daily.temperature_2m_min[index]),
      tempMax: Math.round(daily.temperature_2m_max[index]),
      temperature: Math.round(
        (daily.temperature_2m_min[index] + daily.temperature_2m_max[index]) / 2,
      ),
      description: getWeatherDescription(daily.weathercode[index]),
      icon: getWeatherIcon(daily.weathercode[index]),
      humidity: 0,
      windSpeed: daily.windspeed_10m_max[index],
      pop: daily.precipitation_probability_max[index] ?? 0,
    }));

    await redis.set(cacheKey, JSON.stringify(result), {
      EX: CACHE_TTL_SECONDS,
    });

    log("info", "Forecast fetched from Open-Meteo", {
      city: location.name,
      cacheTtlSeconds: CACHE_TTL_SECONDS,
    });

    res.json(result);
  } catch (error) {
    log("error", "Forecast request failed", {
      city,
      error: error.message,
    });

    res.status(500).json({ error: "Forecast service failed" });
  }
});

app.get("/api/hourly", async (req, res) => {
  const city = String(req.query.city || "Zurich");
  const cacheKey = `hourly:${city.toLowerCase()}`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      log("info", "Hourly forecast served from cache", { city });
      return res.json(JSON.parse(cached));
    }

    const location = await getLocationByCity(city);

    if (!location) {
      log("warn", "City not found for hourly forecast", { city });
      return res.status(404).json({ error: "City not found" });
    }

    const hourlyResponse = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          hourly: "temperature_2m,weathercode,precipitation_probability",
          forecast_days: 2,
          timezone: "auto",
        },
      },
    );

    const hourly = hourlyResponse.data.hourly;

    const result = hourly.time.slice(0, 8).map((time, index) => ({
      time,
      temperature: Math.round(hourly.temperature_2m[index]),
      description: getWeatherDescription(hourly.weathercode[index]),
      icon: getWeatherIcon(hourly.weathercode[index]),
      pop: hourly.precipitation_probability[index] ?? 0,
    }));

    await redis.set(cacheKey, JSON.stringify(result), {
      EX: CACHE_TTL_SECONDS,
    });

    log("info", "Hourly forecast fetched from Open-Meteo", {
      city: location.name,
      cacheTtlSeconds: CACHE_TTL_SECONDS,
    });

    res.json(result);
  } catch (error) {
    log("error", "Hourly forecast request failed", {
      city,
      error: error.message,
    });

    res.status(500).json({ error: "Hourly forecast service failed" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  log("info", "Backend started", {
    port: PORT,
    host: "0.0.0.0",
    nodeEnv: process.env.NODE_ENV || "development",
  });
});