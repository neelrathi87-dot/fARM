"use client";

import React, { useEffect, useState } from "react";
import { FieldSelector } from "./FieldSelector";
import { useFarmStore } from "@/lib/store/farmStore";
import { WeatherTelemetry, DriftHazardAssessment } from "@/lib/weather/openMeteo";
import { CloudRain, Wind, AlertTriangle, CheckCircle2, ShieldAlert, Thermometer, Droplet } from "lucide-react";

interface GlobalStatusBarProps {
  fields: Array<{
    id: string;
    name: string;
    cropType: string;
    areaAcres: number;
    latitude: number;
    longitude: number;
  }>;
}

export const GlobalStatusBar: React.FC<GlobalStatusBarProps> = ({ fields }) => {
  const { selectedFieldId } = useFarmStore();
  const [weather, setWeather] = useState<{
    telemetry: WeatherTelemetry;
    driftRisk: DriftHazardAssessment;
  } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Determine which coordinates to query for weather
  const currentField = fields.find((f) => f.id === selectedFieldId) || fields[0];

  useEffect(() => {
    if (!currentField) return;

    let isMounted = true;
    setLoadingWeather(true);

    fetch(`/api/weather?lat=${currentField.latitude}&lon=${currentField.longitude}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setWeather({
            telemetry: data.telemetry,
            driftRisk: data.driftRisk,
          });
        }
      })
      .catch((err) => console.error("Weather fetch failed:", err))
      .finally(() => {
        if (isMounted) setLoadingWeather(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentField?.latitude, currentField?.longitude]);

  const totalAcreage = fields.reduce((sum, f) => sum + f.areaAcres, 0);

  return (
    <div className="bg-sage-50/80 border-b border-sage-200/80 px-4 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Focus Selector & Farm Acreage */}
        <div className="flex items-center gap-3 flex-wrap">
          <FieldSelector fields={fields} />
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-medium border-l border-slate-300 pl-3">
            <span>Total Farm Estate:</span>
            <span className="font-bold text-slate-800">{totalAcreage.toFixed(1)} Acres</span>
            <span className="text-slate-400">({fields.length} Active Plots)</span>
          </div>
        </div>

        {/* Right: Live Weather Telemetry & Drift Advisory */}
        <div className="flex items-center gap-3 flex-wrap ml-auto">
          {loadingWeather ? (
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Fetching telemetry...</span>
            </div>
          ) : weather ? (
            <div className="flex items-center gap-3">
              {/* Telemetry pills */}
              <div className="hidden lg:flex items-center gap-3 text-slate-600 bg-white/70 border border-slate-200/60 rounded-lg px-2.5 py-1">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Thermometer className="h-3.5 w-3.5 text-amber-500" />
                  {weather.telemetry.temperatureC.toFixed(1)}°C
                </span>
                <span className="flex items-center gap-1">
                  <Droplet className="h-3.5 w-3.5 text-water-500" />
                  {weather.telemetry.relativeHumidity}% RH
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="h-3.5 w-3.5 text-slate-500" />
                  {weather.telemetry.windSpeedKmh.toFixed(1)} km/h
                </span>
                {weather.telemetry.precipitationProbability > 0 && (
                  <span className="flex items-center gap-1 text-sky-600">
                    <CloudRain className="h-3.5 w-3.5" />
                    {weather.telemetry.precipitationProbability}% Rain
                  </span>
                )}
              </div>

              {/* Drift Hazard Alert Badge */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-[11px] shadow-2xs ${
                  weather.driftRisk.level === "SAFE"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : weather.driftRisk.level === "CAUTION"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
                title={weather.driftRisk.recommendation}
              >
                {weather.driftRisk.level === "SAFE" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ) : weather.driftRisk.level === "CAUTION" ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                )}
                <span>{weather.driftRisk.badgeText}</span>
              </div>
            </div>
          ) : (
            <span className="text-slate-400">Weather telemetry pending</span>
          )}
        </div>
      </div>
    </div>
  );
};
