"use client";

import React, { useState } from "react";
import { WaterLogTable } from "./WaterLogTable";
import { WaterLogModal } from "./WaterLogModal";
import { Button } from "@/components/ui/Button";
import { formatVolume, formatDuration } from "@/lib/calculations/irrigationVolume";
import { Droplets, Sparkles, Clock, PlusCircle, Gauge, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

interface IrrigationViewProps {
  fields: Array<{ id: string; name: string; cropType: string; areaAcres: number }>;
  initialLogs: any[];
  initialStats: {
    totalLiters: number;
    normalWaterLiters: number;
    liquidWaterLiters: number;
    totalHours: number;
    logCount: number;
    deliveryBreakdown: Record<string, number>;
  };
}

export const IrrigationView: React.FC<IrrigationViewProps> = ({
  fields,
  initialLogs,
  initialStats,
}) => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [filterFieldId, setFilterFieldId] = useState<string>("ALL");

  const filteredLogs =
    filterFieldId === "ALL"
      ? initialLogs
      : initialLogs.filter((l) => l.fieldId === filterFieldId);

  const normalPercent =
    initialStats.totalLiters > 0
      ? ((initialStats.normalWaterLiters / initialStats.totalLiters) * 100).toFixed(1)
      : "0";
  const liquidPercent =
    initialStats.totalLiters > 0
      ? ((initialStats.liquidWaterLiters / initialStats.totalLiters) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Droplets className="h-6 w-6 text-water-600" />
            Dual-Water Irrigation & Fertigation Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict separation between standard borewell water and nutrient biological slurry with pump flow rate calibrations
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-1.5" />
          Log Water Event
        </Button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Total Water Discharged */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Water Applied
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatVolume(initialStats.totalLiters)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {initialStats.logCount} scheduled runs
          </span>
        </div>

        {/* Normal Water */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-water-700 uppercase tracking-wider flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-water-600" /> Normal Water
            </span>
            <span className="text-xs font-bold text-water-700">{normalPercent}%</span>
          </div>
          <div className="text-2xl font-black text-water-900 mt-1 font-mono">
            {formatVolume(initialStats.normalWaterLiters)}
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-water-500 rounded-full"
              style={{ width: `${normalPercent}%` }}
            />
          </div>
        </div>

        {/* Liquid Water / Nutrients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Liquid Solution
            </span>
            <span className="text-xs font-bold text-emerald-700">{liquidPercent}%</span>
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1 font-mono">
            {formatVolume(initialStats.liquidWaterLiters)}
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${liquidPercent}%` }}
            />
          </div>
        </div>

        {/* Total Runtime Hours */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Pump Runtime Hours
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {initialStats.totalHours} <span className="text-sm font-semibold text-slate-500">Hours</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Active motor duty cycle
          </span>
        </div>
      </div>

      {/* Filter and Log Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Filter By Plot:</span>
            <select
              value={filterFieldId}
              onChange={(e) => setFilterFieldId(e.target.value)}
              className="h-8 px-2.5 border border-slate-300 rounded-md bg-white text-slate-900 font-medium outline-none focus:ring-1 focus:ring-farm-500"
            >
              <option value="ALL">All Plots ({initialLogs.length} Records)</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.cropType})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium ml-auto">
            Showing {filteredLogs.length} irrigation runs
          </div>
        </div>

        <WaterLogTable logs={filteredLogs} onRefresh={() => router.refresh()} />
      </div>

      {/* Modal */}
      <WaterLogModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        fields={fields}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
};
