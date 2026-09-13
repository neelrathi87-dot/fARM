"use client";

import React, { useState } from "react";
import { PesticideHistoryFeed } from "./PesticideHistoryFeed";
import { PesticideModal } from "./PesticideModal";
import { Button } from "@/components/ui/Button";
import { FlaskConical, PlusCircle, Scale, ShieldAlert, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface PesticidesViewProps {
  fields: Array<{ id: string; name: string; cropType: string; areaAcres: number }>;
  initialLogs: any[];
}

export const PesticidesView: React.FC<PesticidesViewProps> = ({ fields, initialLogs }) => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Client-side fuzzy search & date filter
  const filteredLogs = initialLogs.filter((log) => {
    // Date filter
    if (selectedDate) {
      const logDateStr = new Date(log.date).toISOString().split("T")[0];
      if (logDateStr !== selectedDate) return false;
    }

    // Search query
    if (searchQuery.trim() !== "") {
      const term = searchQuery.toLowerCase().trim();
      const matchChemical = log.chemicalName.toLowerCase().includes(term);
      const matchPest = log.targetPest.toLowerCase().includes(term);
      const matchField = log.field?.name?.toLowerCase().includes(term);
      return matchChemical || matchPest || matchField;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-emerald-600" />
            Pesticide & Chemical Engine (SI Conversion)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic concentration engine supporting mL/L, L/L, g/L, and kg/L with auto-normalizing chemical balances
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-1.5" />
          Log Chemical Spray
        </Button>
      </div>

      {/* 4 Feature Badges info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Scale className="h-4 w-4 text-emerald-600" />
            Liquid Concentrations
          </span>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            mL/L & L/L (Auto mL ↔ L)
          </p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Scale className="h-4 w-4 text-farm-600" />
            Powder Concentrations
          </span>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            g/L & kg/L (Auto g ↔ kg)
          </p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-600" />
            Reactive Dosing
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            Real-time tank volume math
          </p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-sky-600" />
            Compliance History
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            Fuzzy search & daily rollup
          </p>
        </div>
      </div>

      {/* History Feed & Search & Rollup */}
      <PesticideHistoryFeed
        logs={filteredLogs}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onRefresh={() => router.refresh()}
      />

      {/* Modal */}
      <PesticideModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        fields={fields}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
};
