"use client";

import React, { useState } from "react";
import { formatVolume, formatDuration } from "@/lib/calculations/irrigationVolume";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Droplets,
  FlaskConical,
  Receipt,
  PlusCircle,
  Clock,
  Gauge,
  Sparkles,
  Bug,
  ShieldCheck,
  Calendar,
  Compass,
  TrendingUp,
  Layers,
  ChevronRight,
  Tractor,
} from "lucide-react";
import { WeatherWidget } from "@/components/weather/WeatherWidget";

interface PlotDailyOperationsProps {
  field: {
    id: string;
    name: string;
    cropType: string;
    areaAcres: number;
    latitude: number;
    longitude: number;
  };
  selectedDate: string; // YYYY-MM-DD
  waterLogs: any[];
  pesticideLogs: any[];
  expenses: any[];
  onOpenWaterModal: () => void;
  onOpenPesticideModal: () => void;
  onOpenExpenseModal: () => void;
}

export const PlotDailyOperations: React.FC<PlotDailyOperationsProps> = ({
  field,
  selectedDate,
  waterLogs,
  pesticideLogs,
  expenses,
  onOpenWaterModal,
  onOpenPesticideModal,
  onOpenExpenseModal,
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "WATER" | "PESTICIDE" | "EXPENSE">("ALL");

  const totalWater = waterLogs.reduce((sum, w) => sum + (w.volumeLiters || 0), 0);
  const normalWater = waterLogs
    .filter((w) => w.waterType === "NORMAL_WATER")
    .reduce((sum, w) => sum + (w.volumeLiters || 0), 0);
  const liquidWater = waterLogs
    .filter((w) => w.waterType === "LIQUID_WATER")
    .reduce((sum, w) => sum + (w.volumeLiters || 0), 0);

  const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Format date display
  const dateObj = new Date(selectedDate + "T00:00:00");
  const friendlyDate = dateObj.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Date Command Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-farm-300 uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5" />
            <span>Daily Operations Command • {field.name}</span>
            {isToday && (
              <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full">
                TODAY
              </span>
            )}
          </div>
          <h2 className="text-lg font-black mt-1 text-white tracking-tight">{friendlyDate}</h2>
          <p className="text-xs text-slate-300">
            {field.cropType} • {field.areaAcres} Acres • Coordinates: {field.latitude.toFixed(4)}, {field.longitude.toFixed(4)}
          </p>
        </div>

        {/* Action Buttons to Log Daily Activities */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenWaterModal}
            className="px-3 py-1.5 bg-water-600 hover:bg-water-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Droplets className="h-3.5 w-3.5" />
            <span>+ Log Water</span>
          </button>

          <button
            type="button"
            onClick={onOpenPesticideModal}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span>+ Log Spray</span>
          </button>

          <button
            type="button"
            onClick={onOpenExpenseModal}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>+ Log Expense</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Badges for Selected Date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Water Stat */}
        <div
          onClick={() => setActiveTab("WATER")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === "WATER"
              ? "bg-water-50 border-water-400 ring-2 ring-water-400/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-water-600" />
              Water Discharged
            </span>
            <span className="text-[11px] font-semibold text-water-700">{waterLogs.length} Runs</span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-1 font-mono">
            {formatVolume(totalWater)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-2">
            <span>{formatVolume(normalWater)} Normal</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">{formatVolume(liquidWater)} Liquid</span>
          </div>
        </div>

        {/* Chemical Spray Stat */}
        <div
          onClick={() => setActiveTab("PESTICIDE")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === "PESTICIDE"
              ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <FlaskConical className="h-3.5 w-3.5 text-emerald-600" />
              Spray Treatments
            </span>
            <span className="text-[11px] font-semibold text-emerald-700">{pesticideLogs.length} Events</span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-1 font-mono">
            {pesticideLogs.length} <span className="text-xs font-medium text-slate-500">Treatments</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 truncate">
            {pesticideLogs.length > 0
              ? pesticideLogs.map((p) => p.chemicalName).join(", ")
              : "No chemical sprays applied"}
          </div>
        </div>

        {/* Daily Expense Stat */}
        <div
          onClick={() => setActiveTab("EXPENSE")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === "EXPENSE"
              ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Receipt className="h-3.5 w-3.5 text-amber-600" />
              Operational Spend
            </span>
            <span className="text-[11px] font-semibold text-amber-700">{expenses.length} Entries</span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrency(totalExpense)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {expenses.length > 0
              ? `${expenses.length} expense items recorded`
              : "No expenses recorded today"}
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === "ALL"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Daily Operations ({waterLogs.length + pesticideLogs.length + expenses.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("WATER")}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === "WATER"
              ? "bg-water-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Droplets className="h-3.5 w-3.5" />
          Water Manager ({waterLogs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PESTICIDE")}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === "PESTICIDE"
              ? "bg-emerald-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FlaskConical className="h-3.5 w-3.5" />
          Pesticide Manager ({pesticideLogs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("EXPENSE")}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === "EXPENSE"
              ? "bg-amber-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Receipt className="h-3.5 w-3.5" />
          Expense Manager ({expenses.length})
        </button>
      </div>

      {/* SECTION 1: WATER MANAGER */}
      {(activeTab === "ALL" || activeTab === "WATER") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-water-50/60 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-water-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Water & Irrigation Records ({waterLogs.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={onOpenWaterModal}
              className="text-xs font-bold text-water-700 hover:text-water-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Record Water Run</span>
            </button>
          </div>

          <div className="p-4">
            {waterLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                No irrigation runs recorded on {friendlyDate}. Click &quot;Record Water Run&quot; to log flow volume.
              </div>
            ) : (
              <div className="space-y-2.5">
                {waterLogs.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {w.startTime} - {w.endTime} ({formatDuration(w.durationMinutes)})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            w.waterType === "NORMAL_WATER"
                              ? "bg-water-100 text-water-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {w.waterType === "NORMAL_WATER" ? "Normal Borewell" : "Nutrient Slurry"}
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-semibold rounded">
                          {w.deliveryMethod}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>Pump: {w.motorHp} HP</span>
                        <span>•</span>
                        <span>Discharge: {w.flowRateLpm} LPM</span>
                        {w.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-600">{w.notes}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-water-700 font-mono block">
                        {formatVolume(w.volumeLiters)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: PESTICIDE / SPRAY MANAGER */}
      {(activeTab === "ALL" || activeTab === "PESTICIDE") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-emerald-50/60 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Chemical Treatments & Spray Records ({pesticideLogs.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={onOpenPesticideModal}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Record Spray Operation</span>
            </button>
          </div>

          <div className="p-4">
            {pesticideLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                No chemical sprays applied on {friendlyDate}. Click &quot;Record Spray Operation&quot; to log treatment.
              </div>
            ) : (
              <div className="space-y-2.5">
                {pesticideLogs.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{p.chemicalName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 flex items-center gap-1">
                          <Bug className="h-2.5 w-2.5" />
                          {p.targetPest}
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-semibold rounded flex items-center gap-1">
                          {(p.applicationMethod === "TRACTOR" || p.applicationMethod === "TRACTOR_SPRAY") && (
                            <Tractor className="h-2.5 w-2.5 text-farm-700" />
                          )}
                          {p.applicationMethod === "TRACTOR" || p.applicationMethod === "TRACTOR_SPRAY"
                            ? "Tractor Spray"
                            : p.applicationMethod === "FOLIAR"
                            ? "Foliar Spray"
                            : p.applicationMethod === "DRENCH"
                            ? "Root Drench"
                            : p.applicationMethod === "FERTIGATION"
                            ? "Fertigation Line"
                            : p.applicationMethod}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>Formulation: {p.formulationType}</span>
                        <span>•</span>
                        <span>Dosage: {p.dosageRate} {p.dosageUnit?.replace("_", "/")}</span>
                        <span>•</span>
                        <span>Spray Volume: {p.sprayVolumeLiters} L</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-emerald-700 font-mono block">
                        {p.netChemicalAmount} {p.netChemicalUnit}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">Active Formula</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: EXPENSE MANAGER */}
      {(activeTab === "ALL" || activeTab === "EXPENSE") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-amber-50/60 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-amber-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Operational Expenses ({expenses.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={onOpenExpenseModal}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Record Expense</span>
            </button>
          </div>

          <div className="p-4">
            {expenses.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                No expenses logged on {friendlyDate}. Click &quot;Record Expense&quot; to track labor, fuel, or supplies.
              </div>
            ) : (
              <div className="space-y-2.5">
                {expenses.map((e) => (
                  <div
                    key={e.id}
                    className="p-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{e.description}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800">
                          {e.category}
                        </span>
                      </div>
                      {e.quantity && e.unitRate && (
                        <div className="text-[11px] text-slate-500">
                          Qty: {e.quantity} @ {formatCurrency(e.unitRate)} each
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-slate-900 font-mono block">
                        {formatCurrency(e.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: LIVE WEATHER TELEMETRY FOR THIS PLOT */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Compass className="h-4 w-4 text-sky-600" />
          <span>Live Atmospheric Telemetry & Spray Hazard at {field.name}</span>
        </h4>
        <WeatherWidget
          latitude={field.latitude}
          longitude={field.longitude}
          locationName={field.name}
        />
      </div>
    </div>
  );
};
