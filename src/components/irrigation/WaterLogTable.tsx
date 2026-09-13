"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatNumber } from "@/lib/utils";
import { formatDuration, formatVolume } from "@/lib/calculations/irrigationVolume";
import { deleteWaterLog } from "@/actions/irrigation";
import { Droplets, Sparkles, Clock, Trash2, Gauge } from "lucide-react";

interface WaterLogItem {
  id: string;
  fieldId: string;
  field: {
    id: string;
    name: string;
    cropType: string;
    areaAcres: number;
  };
  date: Date | string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  waterType: string;
  deliveryMethod: string;
  motorHp: number;
  flowRateLpm: number;
  volumeLiters: number;
  notes?: string | null;
}

interface WaterLogTableProps {
  logs: WaterLogItem[];
  onRefresh?: () => void;
}

export const WaterLogTable: React.FC<WaterLogTableProps> = ({ logs, onRefresh }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this irrigation record?")) {
      setDeletingId(id);
      try {
        await deleteWaterLog(id);
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (logs.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
        <Droplets className="h-10 w-10 text-water-400 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-800">No Irrigation Logs Recorded</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Start recording irrigation events to track normal well water and nutrient liquid water allocations.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          <tr>
            <th className="py-3 px-4">Date & Time</th>
            <th className="py-3 px-4">Plot / Field</th>
            <th className="py-3 px-4">Water Classification</th>
            <th className="py-3 px-4">Method & Motor</th>
            <th className="py-3 px-4">Duration</th>
            <th className="py-3 px-4 text-right">Volume</th>
            <th className="py-3 px-4">Notes</th>
            <th className="py-3 px-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {logs.map((log) => {
            const isNormal = log.waterType === "NORMAL_WATER";
            return (
              <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                  <div>{formatDate(log.date)}</div>
                  <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3 text-slate-600" />
                    {log.startTime} - {log.endTime}
                  </div>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="font-bold text-slate-900">{log.field.name}</div>
                  <div className="text-[11px] text-slate-600">
                    {log.field.cropType} ({log.field.areaAcres} ac)
                  </div>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  {isNormal ? (
                    <Badge variant="water" size="sm" className="font-semibold">
                      <Droplets className="h-3 w-3 text-water-600" />
                      Normal Water
                    </Badge>
                  ) : (
                    <Badge variant="farm" size="sm" className="font-semibold">
                      <Sparkles className="h-3 w-3 text-emerald-600" />
                      Liquid Solution
                    </Badge>
                  )}
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="font-semibold text-slate-800">{log.deliveryMethod}</div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-1 font-mono">
                    <Gauge className="h-3 w-3 text-slate-600" />
                    {log.motorHp} HP ({log.flowRateLpm} L/min)
                  </div>
                </td>

                <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-800">
                  {formatDuration(log.durationMinutes)}
                </td>

                <td className="py-3 px-4 whitespace-nowrap text-right">
                  <span className="font-bold text-slate-900 text-sm">
                    {formatVolume(log.volumeLiters)}
                  </span>
                </td>

                <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                  {log.notes || <span className="text-slate-600 italic">None</span>}
                </td>

                <td className="py-3 px-4 text-center whitespace-nowrap">
                  <button
                    type="button"
                    disabled={deletingId === log.id}
                    onClick={() => handleDelete(log.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
