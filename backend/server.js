import express from "express";
import cors from "cors";
import axios from "axios";
import { createClient } from "redis";

const app = express();

const PORT = process.env.PORT || 3000;

const REDIS_URL =
  process.env.REDIS_URL || "redis://redis.railway.internal:6379";

const CACHE_TTL_SECONDS = Number(
  process.env.CACHE_TTL_SECONDS || 300,
);

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

const redis = createClient({
  url: REDIS_URL,
});

redis.on("error", (err) => {
  log("error", "Redis connection error", {
    error: err.message,
  });
});

try {
  await redis.connect();

  log("info", "Connected to Redis");
} catch (error) {
  log("error", "Could not connect to Redis", {
    error: error.message,
  });
}

app.get("/health", async (req, res) => {
  try {
    await redis.ping();

    res.status(200).json({
      status: "healthy",
      redis: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
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
      log("info", "Weather served from cache", {
        city,
      });

      return res.json({
        ...JSON.parse(cached),
        source: "cache",
      });
    }

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

    const location = geoResponse.data.results?.[0];

    if (!location) {
      log("warn", "City not found", {
        city,
      });

      return res.status(404).json({
        error: "City not found",
      });
    }

    const weatherResponse = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          current_weather: true,
          hourly:
            "relative_humidity_2m,pressure_msl,cloud_cover,visibility",
          forecast_days: 1,
          timezone: "auto",
        },
      },
    );

    const weatherData = weatherResponse.data;

    const currentWeather = weatherData.current_weather;

    const currentIndex = weatherData.hourly.time.findIndex(
      (time) =>
        time.substring(0, 13) ===
        currentWeather.time.substring(0, 13),
    );

    const result = {
      city: location.name,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,

      current_weather: {
        ...currentWeather,

        humidity:
          weatherData.hourly.relative_humidity_2m[
            currentIndex
          ] ?? 0,

        pressure:
          weatherData.hourly.pressure_msl[
            currentIndex
          ] ?? 0,

        visibility:
          weatherData.hourly.visibility[
            currentIndex
          ] ?? 0,

        clouds:
          weatherData.hourly.cloud_cover[
            currentIndex
          ] ?? 0,
      },

      source: "api",
    };

    await redis.set(
      cacheKey,
      JSON.stringify(result),
      {
        EX: CACHE_TTL_SECONDS,
      },
    );

    log("info", "Weather fetched from external API", {
      city: location.name,
      cacheTtlSeconds: CACHE_TTL_SECONDS,
    });

    res.json(result);
  } catch (error) {
    log("error", "Weather request failed", {
      city,
      error: error.message,
    });

    res.status(500).json({
      error: "Weather service failed",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  log("info", "Backend started", {
    port: PORT,
    host: "0.0.0.0",
    nodeEnv:
      process.env.NODE_ENV || "development",
  });
});