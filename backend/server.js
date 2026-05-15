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
  if (code === 95) return "11d";

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

function getUnitParams(units) {
  const isImperial = units === "imperial";
  return {
    temperature_unit: isImperial ? "fahrenheit" : "celsius",
    wind_speed_unit: isImperial ? "mph" : "ms",
  };
}

async function fetchCurrentWeather(latitude, longitude, units) {
  const unitParams = getUnitParams(units);

  const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
    params: {
      latitude,
      longitude,
      current:
        "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m",
      hourly: "visibility",
      daily: "sunrise,sunset",
      timezone: "auto",
      forecast_days: 1,
      ...unitParams,
    },
  });

  return response.data;
}

function pickHourlyValue(hourly, key, currentTime) {
  if (!hourly || !Array.isArray(hourly.time) || !Array.isArray(hourly[key])) {
    return null;
  }

  const index = hourly.time.indexOf(currentTime);

  if (index >= 0) {
    return hourly[key][index];
  }

  const targetMs = new Date(currentTime).getTime();
  let bestIndex = 0;
  let bestDelta = Infinity;

  for (let i = 0; i < hourly.time.length; i++) {
    const delta = Math.abs(new Date(hourly.time[i]).getTime() - targetMs);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = i;
    }
  }

  return hourly[key][bestIndex] ?? null;
}

function localTimeToUnix(localTimeString, utcOffsetSeconds) {
  if (!localTimeString) return 0;
  // Open-Meteo returns local time strings without timezone designator when
  // timezone=auto. Parse as UTC then subtract the location's offset to get
  // the true Unix timestamp.
  const asUtc = Date.parse(`${localTimeString}Z`);
  if (Number.isNaN(asUtc)) return 0;
  return Math.floor((asUtc - utcOffsetSeconds * 1000) / 1000);
}

function mapCurrentWeather(location, weatherData) {
  const current = weatherData.current || {};
  const daily = weatherData.daily || {};
  const weatherCode = current.weather_code;
  const currentTime = current.time;
  const utcOffsetSeconds = weatherData.utc_offset_seconds ?? 0;

  const visibilityMeters = pickHourlyValue(
    weatherData.hourly,
    "visibility",
    currentTime,
  );

  return {
    city: location.name,
    country: location.country || "",
    temperature: Math.round(current.temperature_2m ?? 0),
    feelsLike: Math.round(
      current.apparent_temperature ?? current.temperature_2m ?? 0,
    ),
    description: getWeatherDescription(weatherCode),
    icon: getWeatherIcon(weatherCode),
    humidity: Math.round(current.relative_humidity_2m ?? 0),
    windSpeed: current.wind_speed_10m ?? 0,
    windDeg: current.wind_direction_10m ?? 0,
    pressure: Math.round(current.pressure_msl ?? 0),
    visibility: visibilityMeters ?? 0,
    clouds: Math.round(current.cloud_cover ?? 0),
    sunrise: localTimeToUnix(daily.sunrise?.[0], utcOffsetSeconds),
    sunset: localTimeToUnix(daily.sunset?.[0], utcOffsetSeconds),
    lat: location.latitude,
    lon: location.longitude,
    dt: localTimeToUnix(currentTime, utcOffsetSeconds),
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
  const units = req.query.units === "imperial" ? "imperial" : "metric";
  const cacheKey = `weather:${units}:${city.toLowerCase()}`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      log("info", "Weather served from cache", { city, units });
      return res.json(JSON.parse(cached));
    }

    const location = await getLocationByCity(city);

    if (!location) {
      log("warn", "City not found", { city });
      return res.status(404).json({ error: "City not found" });
    }

    const weatherData = await fetchCurrentWeather(
      location.latitude,
      location.longitude,
      units,
    );

    const result = mapCurrentWeather(location, weatherData);

    await redis.set(cacheKey, JSON.stringify(result), {
      EX: CACHE_TTL_SECONDS,
    });

    log("info", "Weather fetched from Open-Meteo", {
      city: location.name,
      units,
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
  const units = req.query.units === "imperial" ? "imperial" : "metric";

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  const cacheKey = `weather:coords:${units}:${lat}:${lon}`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      log("info", "Coordinate weather served from cache", { lat, lon, units });
      return res.json(JSON.parse(cached));
    }

    const weatherData = await fetchCurrentWeather(lat, lon, units);

    const location = {
      name: "Aktueller Standort",
      country: "",
      latitude: lat,
      longitude: lon,
    };

    const result = mapCurrentWeather(location, weatherData);

    await redis.set(cacheKey, JSON.stringify(result), {
      EX: CACHE_TTL_SECONDS,
    });

    log("info", "Coordinate weather fetched from Open-Meteo", {
      lat,
      lon,
      units,
    });

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
  const units = req.query.units === "imperial" ? "imperial" : "metric";
  const cacheKey = `forecast:${units}:${city.toLowerCase()}`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      log("info", "Forecast served from cache", { city, units });
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
            "weathercode,temperature_2m_min,temperature_2m_max,precipitation_probability_max,windspeed_10m_max",
          forecast_days: 5,
          timezone: "auto",
          ...getUnitParams(units),
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
  const units = req.query.units === "imperial" ? "imperial" : "metric";
  const cacheKey = `hourly:${units}:${city.toLowerCase()}`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      log("info", "Hourly forecast served from cache", { city, units });
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
          ...getUnitParams(units),
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
