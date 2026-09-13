export interface WeatherTelemetry {
  temperatureC: number;
  relativeHumidity: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  precipitationMm: number;
  precipitationProbability: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  time: string;
}

export type DriftHazardLevel = "SAFE" | "CAUTION" | "HIGH_RISK";

export interface DriftHazardAssessment {
  level: DriftHazardLevel;
  badgeText: string;
  title: string;
  reasons: string[];
  recommendation: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const WMO_WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

/**
 * Fetches live weather telemetry from Open-Meteo REST API for a given coordinate.
 */
export async function fetchWeatherTelemetry(latitude: number, longitude: number): Promise<WeatherTelemetry> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=precipitation_probability&forecast_days=1`;

  const res = await fetch(url, { next: { revalidate: 900 } }); // cache 15 min
  if (!res.ok) {
    throw new Error(`Open-Meteo API returned status: ${res.status}`);
  }

  const data = await res.json();
  const current = data.current;
  const hourly = data.hourly;

  const currentHour = new Date(current.time).getHours();
  const precipProb = hourly?.precipitation_probability?.[currentHour] ?? 0;

  return {
    temperatureC: current.temperature_2m,
    relativeHumidity: current.relative_humidity_2m,
    windSpeedKmh: current.wind_speed_10m,
    windDirectionDeg: current.wind_direction_10m,
    precipitationMm: current.precipitation,
    precipitationProbability: precipProb,
    weatherCode: current.weather_code,
    weatherDescription: WMO_WEATHER_CODES[current.weather_code] ?? "Variable weather",
    isDay: Boolean(current.is_day),
    time: current.time,
  };
}

/**
 * Assesses chemical spray drift hazard and washout risk based on agricultural standards.
 */
export function assessSprayDriftRisk(telemetry: WeatherTelemetry): DriftHazardAssessment {
  const reasons: string[] = [];
  let isDanger = false;
  let isCaution = false;

  // 1. Rain / Washout Risk
  if (telemetry.precipitationMm > 0.2 || telemetry.precipitationProbability >= 40) {
    isDanger = true;
    reasons.push(
      `Washout Risk: Rain observed (${telemetry.precipitationMm} mm) or high rain probability (${telemetry.precipitationProbability}%). Chemical will wash off foliage.`
    );
  }

  // 2. Wind Velocity Risk
  if (telemetry.windSpeedKmh > 20) {
    isDanger = true;
    reasons.push(
      `Severe Wind Velocity: Wind is ${telemetry.windSpeedKmh.toFixed(1)} km/h (>20 km/h threshold). Massive off-target drift hazard.`
    );
  } else if (telemetry.windSpeedKmh >= 15 && telemetry.windSpeedKmh <= 20) {
    isCaution = true;
    reasons.push(
      `Moderate Wind: ${telemetry.windSpeedKmh.toFixed(1)} km/h. Requires coarse spray nozzles and low boom height.`
    );
  } else if (telemetry.windSpeedKmh < 3) {
    isCaution = true;
    reasons.push(
      `Atmospheric Inversion Hazard: Wind is under 3 km/h (${telemetry.windSpeedKmh.toFixed(1)} km/h). Droplets may hover and drift unpredictably.`
    );
  }

  // 3. Humidity / Evaporation Risk
  if (telemetry.relativeHumidity < 40) {
    isCaution = true;
    reasons.push(
      `Low Relative Humidity (${telemetry.relativeHumidity}%): Droplets evaporate into airborne fine aerosols before canopy contact.`
    );
  }

  // 4. Temperature Check
  if (telemetry.temperatureC > 32) {
    isCaution = true;
    reasons.push(`High Temperature (${telemetry.temperatureC}°C): Increases volatilization and phytotoxicity risk.`);
  }

  if (isDanger) {
    return {
      level: "HIGH_RISK",
      badgeText: "HIGH DRIFT / WASHOUT RISK",
      title: "Spray Operations Prohibited",
      reasons,
      recommendation: "Halt all chemical spraying. Wait for wind to subside below 15 km/h and rain clearance.",
      colorClass: "text-rose-700 dark:text-rose-400",
      bgClass: "bg-rose-50 dark:bg-rose-950/40",
      borderClass: "border-rose-200 dark:border-rose-800",
    };
  }

  if (isCaution) {
    return {
      level: "CAUTION",
      badgeText: "SPRAY WITH CAUTION",
      title: "Marginal Spraying Conditions",
      reasons,
      recommendation: "Apply only with anti-drift additives, coarse droplets (>250 microns), and maintain vegetative buffer zones.",
      colorClass: "text-amber-700 dark:text-amber-400",
      bgClass: "bg-amber-50 dark:bg-amber-950/40",
      borderClass: "border-amber-200 dark:border-amber-800",
    };
  }

  return {
    level: "SAFE",
    badgeText: "OPTIMAL SPRAY WINDOW",
    title: "Conditions Ideal for Application",
    reasons: [
      `Safe wind velocity (${telemetry.windSpeedKmh.toFixed(1)} km/h between 3-15 km/h window)`,
      `Optimal relative humidity (${telemetry.relativeHumidity}%) minimizes droplet evaporation`,
      `Zero precipitation threat (${telemetry.precipitationProbability}% chance of rain)`,
    ],
    recommendation: "Safe for foliar pesticides, fungicides, and liquid micronutrient spraying.",
    colorClass: "text-emerald-700 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
    borderClass: "border-emerald-200 dark:border-emerald-800",
  };
}
