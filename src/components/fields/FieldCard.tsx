"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { deleteField } from "@/actions/fields";
import { useFarmStore } from "@/lib/store/farmStore";
import {
  MapPin,
  Sprout,
  Droplets,
  Receipt,
  Edit2,
  Trash2,
  Maximize2,
  FlaskConical,
} from "lucide-react";

interface FieldCardProps {
  field: {
    id: string;
    name: string;
    cropType: string;
    areaAcres: number;
    latitude: number;
    longitude: number;
    totalWaterLiters: number;
    totalExpense: number;
    _count: {
      waterLogs: number;
      pesticideLogs: number;
      dailyExpenses: number;
    };
  };
  onEdit: (field: any) => void;
  onRefresh?: () => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({ field, onEdit, onRefresh }) => {
  const { selectedFieldId, setSelectedFieldId, setMapCenter } = useFarmStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const isSelected = field.id === selectedFieldId;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete plot "${field.name}"? This removes all associated logs.`)) {
      setIsDeleting(true);
      try {
        await deleteField(field.id);
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSelect = () => {
    setSelectedFieldId(field.id);
    setMapCenter([field.latitude, field.longitude]);
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 border-2 ${
        isSelected
          ? "border-farm-500 shadow-md bg-farm-50/20 ring-2 ring-farm-500/20"
          : "border-slate-200/80 hover:border-farm-300 hover:shadow-md"
      }`}
      onClick={handleSelect}
    >
      <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold text-slate-900">{field.name}</CardTitle>
            {isSelected && (
              <Badge variant="farm" size="sm">
                Active Focus
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Sprout className="h-3.5 w-3.5 text-farm-600" />
              {field.cropType}
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-800">{field.areaAcres} Acres</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Edit Plot"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(field);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Delete Plot"
            disabled={isDeleting}
            onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3 text-xs">
        {/* Metric Aggregates */}
        <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-600 flex items-center gap-1">
              <Droplets className="h-3 w-3 text-water-600" />
              Water
            </span>
            <span className="font-bold text-water-800 text-xs">
              {field.totalWaterLiters.toLocaleString()} L
            </span>
          </div>

          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <FlaskConical className="h-3 w-3 text-emerald-600" />
              Sprays
            </span>
            <span className="font-bold text-slate-800 text-xs">
              {field._count.pesticideLogs} events
            </span>
          </div>

          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Receipt className="h-3 w-3 text-amber-600" />
              Spend
            </span>
            <span className="font-bold text-slate-800 text-xs font-mono">
              ₹{field.totalExpense.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* GPS location and quick center */}
        <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
          <span className="flex items-center gap-1 font-mono">
            <MapPin className="h-3 w-3 text-slate-600" />
            {field.latitude.toFixed(4)}, {field.longitude.toFixed(4)}
          </span>
          <span className="text-farm-600 font-semibold flex items-center gap-1 hover:underline">
            <Maximize2 className="h-3 w-3" /> Focus
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
