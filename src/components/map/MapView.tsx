"use client";

import React, { useState } from "react";
import { FieldMapWrapper } from "@/components/fields/FieldMapWrapper";
import { useFarmStore } from "@/lib/store/farmStore";
import { Button } from "@/components/ui/Button";
import {
  Map,
  MapPin,
  Sprout,
  PlusCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
} from "lucide-react";

interface MapViewProps {
  fields: any[];
}

export const MapView: React.FC<MapViewProps> = ({ fields }) => {
  const { openModal } = useFarmStore();
  const [selectedFieldId, setSelectedFieldId] = useState<string>(
    fields[0]?.id || ""
  );

  const activeField = fields.find((f) => f.id === selectedFieldId) || fields[0] || null;

  const totalAcres = fields.reduce((acc, f) => acc + (f.areaAcres || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Map className="h-6 w-6 text-farm-600" />
              <span>Farm Geospatial & Satellite Map</span>
            </h1>
            <span className="text-[11px] text-emerald-700 font-semibold px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Google Maps API
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Interactive satellite imagery, plot boundary tracking, Google Places search, and GPS location
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {activeField && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${activeField.latitude},${activeField.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open active plot in Google Maps app"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              <span>Google Maps ↗</span>
            </a>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => openModal("FIELD")}
            className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>New Plot</span>
          </Button>
        </div>
      </div>

      {/* Plot Selector Chips (if multiple plots exist) */}
      {fields.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              Active Focus:
            </span>
            {fields.map((f) => {
              const isSelected = f.id === activeField?.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFieldId(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-farm-600 text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Sprout className="h-3.5 w-3.5" />
                  <span>{f.name}</span>
                  <span className={`text-[10px] ${isSelected ? "text-farm-200" : "text-slate-400"}`}>
                    ({f.cropType} • {f.areaAcres} ac)
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 pr-1">
            <span className="font-semibold text-slate-800">{fields.length}</span> Plots •{" "}
            <span className="font-semibold text-slate-800">{totalAcres.toFixed(1)}</span> Total Acres
          </div>
        </div>
      )}

      {/* Main Full-Height Geospatial Map */}
      <div className="h-[calc(100vh-250px)] min-h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-md">
        <FieldMapWrapper
          fields={fields}
          selectedFieldId={activeField?.id}
          onSelectField={(id) => setSelectedFieldId(id)}
          center={
            activeField
              ? [activeField.latitude, activeField.longitude]
              : [18.5204, 73.8567]
          }
          zoom={fields.length > 0 ? 14 : 12}
        />
      </div>

      {/* Helpful Tips Banner */}
      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Pro Tip:</strong> Use the search bar in the top-left of the map to search by village name or 6-digit Indian PIN code (e.g. <code>412306</code>) for instant Google Places location.
          </span>
        </div>
        <span className="text-[11px] text-emerald-700 font-medium shrink-0">
          Click any point on the map to drop a pin and add a plot
        </span>
      </div>
    </div>
  );
};
