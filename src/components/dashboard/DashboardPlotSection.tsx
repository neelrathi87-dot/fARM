"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FieldMapWrapper } from "@/components/fields/FieldMapWrapper";
import { formatCurrency } from "@/lib/utils";
import { formatVolume } from "@/lib/calculations/irrigationVolume";
import {
  Sprout,
  Calendar,
  Layers,
  MapPin,
  Droplets,
  Receipt,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface DashboardPlotSectionProps {
  fields: any[];
  primaryField: any;
}

export const DashboardPlotSection: React.FC<DashboardPlotSectionProps> = ({
  fields,
  primaryField,
}) => {
  const [showMap, setShowMap] = useState<boolean>(false);

  return (
    <div className="space-y-3">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Sprout className="h-4 w-4 text-farm-600" />
            Active Plot Command Hub
          </h3>
          <span className="text-[11px] font-bold px-2 py-0.5 bg-farm-50 text-farm-700 rounded-full border border-farm-200/60">
            {primaryField.name} ({primaryField.cropType})
          </span>
        </div>

        {/* Map Toggle & Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              showMap
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-farm-600" />
            <span>{showMap ? "Hide Satellite Map" : "Show Satellite Map"}</span>
          </button>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${primaryField.latitude},${primaryField.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 transition-colors cursor-pointer"
            title="Open in Google Maps"
          >
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Google Maps</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Main Plot Command Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900">
                {primaryField.name}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {primaryField.cropType}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                • {primaryField.areaAcres} Acres
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <MapPin className="h-3 w-3 text-slate-400" />
              <span>
                GPS: {primaryField.latitude?.toFixed(4)}, {primaryField.longitude?.toFixed(4)}
              </span>
            </div>
          </div>

          <Link
            href="/fields"
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-farm-600 hover:bg-farm-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Open Plot Operations Calendar</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Discharged Water
            </span>
            <div className="text-lg font-black text-water-700 font-mono flex items-center gap-1">
              <Droplets className="h-4 w-4 text-water-500" />
              <span>{formatVolume(primaryField.totalWaterLiters || 0)}</span>
            </div>
            <span className="text-[10px] text-slate-400">Cumulative irrigation balance</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Recorded Spend
            </span>
            <div className="text-lg font-black text-amber-700 font-mono flex items-center gap-1">
              <Receipt className="h-4 w-4 text-amber-500" />
              <span>{formatCurrency(primaryField.totalExpense || 0)}</span>
            </div>
            <span className="text-[10px] text-slate-400">Total plot expenditure</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Daily Tracking
            </span>
            <div className="text-lg font-black text-emerald-700 flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span>Active</span>
            </div>
            <span className="text-[10px] text-slate-400">Log water, sprays & expenses daily</span>
          </div>
        </div>
      </div>

      {/* Optional Minimizable Satellite Map */}
      {showMap && (
        <div className="h-[380px] rounded-xl overflow-hidden border border-slate-200 shadow-sm animate-in fade-in duration-200">
          <FieldMapWrapper
            fields={fields}
            center={[primaryField.latitude, primaryField.longitude]}
            zoom={fields.length > 0 ? 12 : 5}
          />
        </div>
      )}
    </div>
  );
};
