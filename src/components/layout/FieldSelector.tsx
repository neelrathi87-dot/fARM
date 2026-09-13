"use client";

import React from "react";
import { useFarmStore } from "@/lib/store/farmStore";
import { MapPin, ChevronDown } from "lucide-react";

interface FieldItem {
  id: string;
  name: string;
  cropType: string;
  areaAcres: number;
}

interface FieldSelectorProps {
  fields: FieldItem[];
}

export const FieldSelector: React.FC<FieldSelectorProps> = ({ fields }) => {
  const { selectedFieldId, setSelectedFieldId } = useFarmStore();

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-2 bg-white/90 border border-slate-200 shadow-sm rounded-lg px-3 py-1.5 text-xs text-slate-700 hover:border-slate-300 transition-colors">
        <MapPin className="h-3.5 w-3.5 text-farm-600 shrink-0" />
        <span className="font-medium text-slate-500">Active Focus:</span>
        <select
          value={selectedFieldId}
          onChange={(e) => setSelectedFieldId(e.target.value)}
          className="bg-transparent font-semibold text-slate-900 border-none outline-none cursor-pointer pr-4 focus:ring-0 text-xs"
        >
          <option value="ALL">Whole Farm (All {fields.length} Plots)</option>
          {fields.map((field) => (
            <option key={field.id} value={field.id}>
              {field.name} ({field.cropType} - {field.areaAcres} ac)
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
