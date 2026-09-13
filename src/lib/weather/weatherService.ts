import { fetchWeatherTelemetry as fetchOpenMeteoTelemetry, assessSprayDriftRisk } from "./openMeteo";

export interface UnifiedWeatherTelemetry {
  source: "OpenWeather" | "Open-Meteo";
  temperatureC: number;
  relativeHumidity: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  precipitationMm: number;
  precipitationProbability: number;
  weatherCode: number | string;
  weatherDescription: string;
  cityName?: string;
  isDay: boolean;
  time: string;
}

/**
 * Fetches live weather telemetry using OpenWeather API if key is provided,
 * with seamless fallback to Open-Meteo API.
 */
export async function fetchLiveWeather(
  latitude: number,
  longitude: number
): Promise<UnifiedWeatherTelemetry> {
  const apiKey =
    process.env.OPENWEATHER_API_KEY ||
    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
    "c03de4415c1a38120c63282ef4141104";

  if (apiKey) {
    try {
      // 1. Current Weather
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
      const res = await fetch(weatherUrl, { next: { revalidate: 300 } });

      if (res.ok) {
        const data = await res.json();

        // 2. Forecast for rain probability (pop)
        let precipProb = 0;
        try {
          const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&cnt=4&appid=${apiKey}`;
          const forecastRes = await fetch(forecastUrl, { next: { revalidate: 900 } });
          if (forecastRes.ok) {
            const forecastData = await forecastRes.json();
            const firstSlot = forecastData?.list?.[0];
            if (firstSlot && typeof firstSlot.pop === "number") {
              precipProb = Math.round(firstSlot.pop * 100);
            }
          }
        } catch (e) {
          // non-blocking
        }

        const windSpeedKmh = Number(((data.wind?.speed ?? 0) * 3.6).toFixed(1)); // m/s to km/h
        const rainMm = data.rain?.["1h"] ?? data.rain?.["3h"] ?? 0;

        const isDay = data.weather?.[0]?.icon?.includes("d") ?? true;

        return {
          source: "OpenWeather",
          temperatureC: Number(data.main?.temp?.toFixed(1) ?? 20),
          relativeHumidity: data.main?.humidity ?? 50,
          windSpeedKmh,
          windDirectionDeg: data.wind?.deg ?? 0,
          precipitationMm: rainMm,
          precipitationProbability: precipProb,
          weatherCode: data.weather?.[0]?.id ?? 800,
          weatherDescription: data.weather?.[0]?.description ?? "Clear",
          cityName: data.name,
          isDay,
          time: new Date((data.dt ?? Date.now() / 1000) * 1000).toISOString(),
        };
      }
    } catch (error) {
      console.warn("OpenWeather fetch failed, falling back to Open-Meteo:", error);
    }
  }

  // Fallback to Open-Meteo
  const meteo = await fetchOpenMeteoTelemetry(latitude, longitude);
  return {
    source: "Open-Meteo",
    ...meteo,
  };
}

export { assessSprayDriftRisk };
