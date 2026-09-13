"use client";

import React from "react";
import { formatVolume } from "@/lib/calculations/irrigationVolume";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Droplets, FlaskConical, Receipt, Calendar, ChevronRight, History } from "lucide-react";

interface PlotTimelineHistoryProps {
  activityByDate: Record<
    string,
    {
      waterLogs: any[];
      pesticideLogs: any[];
      expenses: any[];
      totalWaterLiters: number;
      totalExpense: number;
    }
  >;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export const PlotTimelineHistory: React.FC<PlotTimelineHistoryProps> = ({
  activityByDate,
  selectedDate,
  onSelectDate,
}) => {
  // Sort dates descending
  const sortedDates = Object.keys(activityByDate).sort((a, b) => b.localeCompare(a));

  if (sortedDates.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
        <History className="h-8 w-8 mx-auto text-slate-300 mb-2" />
        <p className="font-semibold text-slate-600">No historical records logged yet.</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Select a date on the calendar above and log your water, sprays, or expenses.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-farm-600" />
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Chronological Daily History ({sortedDates.length} Days Recorded)
          </h3>
        </div>
        <span className="text-[11px] text-slate-500">
          Click any day to inspect and update operations
        </span>
      </div>

      <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
        {sortedDates.map((dateStr) => {
          const act = activityByDate[dateStr];
          const isSelected = dateStr === selectedDate;
          const dateObj = new Date(dateStr + "T00:00:00");
          const formatted = dateObj.toLocaleDateString("en-IN", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={`w-full text-left p-3.5 transition-colors flex items-center justify-between gap-3 ${
                isSelected
                  ? "bg-farm-50/80 hover:bg-farm-50 border-l-4 border-l-farm-600"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-bold text-slate-900 text-xs">{formatted}</span>
                  {isSelected && (
                    <span className="px-1.5 py-0.2 rounded bg-farm-600 text-white text-[10px] font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  {act.totalWaterLiters > 0 && (
                    <span className="flex items-center gap-1 text-water-700 font-semibold">
                      <Droplets className="h-3 w-3" />
                      {formatVolume(act.totalWaterLiters)} ({act.waterLogs.length} runs)
                    </span>
                  )}

                  {act.pesticideLogs.length > 0 && (
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <FlaskConical className="h-3 w-3" />
                      {act.pesticideLogs.length} Spray {act.pesticideLogs.length === 1 ? "Treatment" : "Treatments"}
                    </span>
                  )}

                  {act.totalExpense > 0 && (
                    <span className="flex items-center gap-1 text-amber-700 font-semibold">
                      <Receipt className="h-3 w-3" />
                      {formatCurrency(act.totalExpense)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
