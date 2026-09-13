"use client";

import React, { useEffect, useState } from "react";
import { WeatherTelemetry, DriftHazardAssessment } from "@/lib/weather/openMeteo";
import { DriftHazardBadge } from "./DriftHazardBadge";
import {
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Compass,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  locationName?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  latitude,
  longitude,
  locationName,
}) => {
  const [data, setData] = useState<{
    telemetry: WeatherTelemetry;
    driftRisk: DriftHazardAssessment;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
      if (!res.ok) throw new Error("Failed to load weather data");
      const json = await res.json();
      if (json.success) {
        setData({
          telemetry: json.telemetry,
          driftRisk: json.driftRisk,
        });
      } else {
        setError(json.error || "Failed to fetch weather");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to weather API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [latitude, longitude]);

  if (loading && !data) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center min-h-[220px]">
        <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
          <RefreshCw className="h-6 w-6 animate-spin text-farm-600" />
          <span>Connecting to Open-Meteo telemetry...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center gap-2 text-rose-600 font-bold mb-2">
          <AlertCircle className="h-4 w-4" />
          <span>Weather Telemetry Offline</span>
        </div>
        <p className="text-slate-500 mb-3">{error}</p>
        <button
          onClick={fetchWeather}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700 text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { telemetry, driftRisk } = data;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header with Drift Hazard Badge */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">
              Live Weather & Spray Intelligence
            </h4>
            {loading && <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />}
            <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold border border-sky-200">
              OpenWeather API
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {locationName ? locationName : "Current Coordinates"}: {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°W • {telemetry.weatherDescription}
          </p>
        </div>

        <DriftHazardBadge assessment={driftRisk} size="md" />
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Temperature */}
        <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            <Thermometer className="h-3.5 w-3.5 text-amber-600" />
            Ambient Temp
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
            {telemetry.temperatureC.toFixed(1)}°C
          </div>
          <span className="text-[10px] text-slate-500">
            {(telemetry.temperatureC * 1.8 + 32).toFixed(1)}°F
          </span>
        </div>

        {/* Humidity */}
        <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-lg">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 uppercase tracking-wider">
            <Droplets className="h-3.5 w-3.5 text-sky-600" />
            Rel. Humidity
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
            {telemetry.relativeHumidity}%
          </div>
          <span className="text-[10px] text-slate-500">
            {telemetry.relativeHumidity < 40
              ? "Rapid Evaporation"
              : telemetry.relativeHumidity > 80
              ? "Dew / Humid"
              : "Optimal Window"}
          </span>
        </div>

        {/* Wind Speed */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            <Wind className="h-3.5 w-3.5 text-slate-500" />
            Wind Velocity
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
            {telemetry.windSpeedKmh.toFixed(1)} <span className="text-xs font-normal">km/h</span>
          </div>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Compass className="h-2.5 w-2.5" />
            {(telemetry.windSpeedKmh * 0.621371).toFixed(1)} mph • {telemetry.windDirectionDeg}°
          </span>
        </div>

        {/* Rain Probability */}
        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
            <CloudRain className="h-3.5 w-3.5 text-blue-600" />
            Precipitation
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
            {telemetry.precipitationProbability}%
          </div>
          <span className="text-[10px] text-slate-500">
            Rain Observed: {telemetry.precipitationMm} mm
          </span>
        </div>
      </div>

      {/* Drift Risk Advisory Banner */}
      <div className={`mx-4 mb-4 p-3 rounded-lg border text-xs ${driftRisk.bgClass} ${driftRisk.borderClass}`}>
        <div className="font-bold mb-1 flex items-center gap-1.5 text-slate-900">
          <ShieldCheck className="h-4 w-4 text-slate-700" />
          <span>Agronomic Recommendation: {driftRisk.title}</span>
        </div>
        <p className="text-slate-700 mb-2">{driftRisk.recommendation}</p>

        {driftRisk.reasons.length > 0 && (
          <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
            {driftRisk.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
