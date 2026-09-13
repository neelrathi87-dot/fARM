"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { deletePesticideLog } from "@/actions/pesticides";
import {
  Search,
  Calendar as CalendarIcon,
  FlaskConical,
  Bug,
  Scale,
  Trash2,
  Layers,
  Sparkles,
  Tractor,
  X,
} from "lucide-react";

interface PesticideLogItem {
  id: string;
  fieldId: string;
  field: {
    id: string;
    name: string;
    cropType: string;
  };
  date: Date | string;
  timestamp: Date | string;
  chemicalName: string;
  targetPest: string;
  formulationType: string;
  dosageRate: number;
  dosageUnit: string;
  sprayVolumeLiters: number;
  netChemicalAmount: number;
  netChemicalUnit: string;
  applicationMethod: string;
}

interface PesticideHistoryFeedProps {
  logs: PesticideLogItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDate: string | null;
  onDateChange: (d: string | null) => void;
  onRefresh?: () => void;
}

export const PesticideHistoryFeed: React.FC<PesticideHistoryFeedProps> = ({
  logs,
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
  onRefresh,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this chemical spray record?")) {
      setDeletingId(id);
      try {
        await deletePesticideLog(id);
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Compute rollup for the filtered results or selected date
  let totalSprayMix = 0;
  let totalLiquidL = 0;
  let totalDryKg = 0;

  for (const log of logs) {
    totalSprayMix += log.sprayVolumeLiters;
    if (log.netChemicalUnit === "L") {
      totalLiquidL += log.netChemicalAmount;
    } else if (log.netChemicalUnit === "mL") {
      totalLiquidL += log.netChemicalAmount / 1000;
    } else if (log.netChemicalUnit === "kg") {
      totalDryKg += log.netChemicalAmount;
    } else if (log.netChemicalUnit === "g") {
      totalDryKg += log.netChemicalAmount / 1000;
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Date Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Full-text fuzzy search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by chemical, pest, or plot..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-farm-500 outline-none text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="relative flex items-center">
            <CalendarIcon className="h-4 w-4 text-slate-500 mr-1.5" />
            <span className="font-medium text-slate-600 mr-2">Filter Date:</span>
            <input
              type="date"
              value={selectedDate || ""}
              onChange={(e) => onDateChange(e.target.value || null)}
              className="h-9 px-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-farm-500 outline-none text-xs"
            />
            {selectedDate && (
              <button
                onClick={() => onDateChange(null)}
                className="ml-2 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-semibold flex items-center gap-1"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Daily Usage Rollup Banner */}
      <div className="bg-gradient-to-r from-farm-700 to-farm-900 text-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-farm-200 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {selectedDate ? `Daily Rollup for ${formatDate(selectedDate)}` : "Aggregated Usage Rollup"}
            </span>
            <h3 className="text-sm font-bold mt-0.5">
              {logs.length} Application {logs.length === 1 ? "Event" : "Events"} Tracked
            </h3>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
              <span className="block text-[10px] text-farm-200 uppercase font-semibold">
                Total Spray Mix
              </span>
              <span className="text-sm font-extrabold font-mono">
                {totalSprayMix.toLocaleString()} Liters
              </span>
            </div>

            <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
              <span className="block text-[10px] text-farm-200 uppercase font-semibold">
                Net Liquid Chemical
              </span>
              <span className="text-sm font-extrabold font-mono">
                {totalLiquidL.toFixed(2)} L
              </span>
            </div>

            <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
              <span className="block text-[10px] text-farm-200 uppercase font-semibold">
                Net Powder / Granular
              </span>
              <span className="text-sm font-extrabold font-mono">
                {totalDryKg.toFixed(2)} kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feed List */}
      {logs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
          <FlaskConical className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No Chemical Logs Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedDate
              ? "No records matched your search or date filter. Try clearing filters."
              : "No pesticide or chemical spray logs recorded yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-farm-300 hover:shadow transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{log.chemicalName}</span>
                    <Badge
                      variant={log.formulationType === "LIQUID" ? "water" : "farm"}
                      size="sm"
                    >
                      {log.formulationType === "LIQUID" ? "Liquid" : "Dry Powder"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{log.field.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-rose-600 font-medium">
                      <Bug className="h-3 w-3" />
                      {log.targetPest}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={deletingId === log.id}
                  onClick={() => handleDelete(log.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Formulation Dosage Details */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400">
                    Dosage Rate
                  </span>
                  <span className="font-bold text-slate-800 font-mono">
                    {log.dosageRate} {log.dosageUnit.replace("_", "/")}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400">
                    Spray Tank Mix
                  </span>
                  <span className="font-bold text-slate-800 font-mono">
                    {log.sprayVolumeLiters.toLocaleString()} L
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <span className="block text-[10px] uppercase font-semibold text-slate-400">
                    Method
                  </span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    {(log.applicationMethod === "TRACTOR" || log.applicationMethod === "TRACTOR_SPRAY") && (
                      <Tractor className="h-3.5 w-3.5 text-farm-700" />
                    )}
                    {log.applicationMethod === "TRACTOR" || log.applicationMethod === "TRACTOR_SPRAY"
                      ? "Tractor Spray"
                      : log.applicationMethod === "FOLIAR"
                      ? "Foliar Spray"
                      : log.applicationMethod === "DRENCH"
                      ? "Root Drench"
                      : log.applicationMethod === "FERTIGATION"
                      ? "Fertigation Line"
                      : log.applicationMethod}
                  </span>
                </div>
              </div>

              {/* Net Active Chemical Display Badge */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5 text-farm-600" />
                  Net Active Chemical:
                </span>
                <span className="font-mono font-extrabold text-sm text-farm-700 bg-farm-50 px-2 py-0.5 rounded border border-farm-200">
                  {log.netChemicalAmount.toLocaleString()} {log.netChemicalUnit}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 text-right">
                Applied on {formatDate(log.date)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
