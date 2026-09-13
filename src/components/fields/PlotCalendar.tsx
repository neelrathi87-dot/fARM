"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Droplets, FlaskConical, Receipt, Calendar as CalendarIcon } from "lucide-react";

export interface DayActivitySummary {
  waterLiters: number;
  waterCount: number;
  pesticideCount: number;
  expenseAmount: number;
  expenseCount: number;
}

interface PlotCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  activityByDate: Record<string, DayActivitySummary>;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const PlotCalendar: React.FC<PlotCalendarProps> = ({
  selectedDate,
  onSelectDate,
  activityByDate,
}) => {
  // Parse current view month from selectedDate or today
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed

  const todayStr = new Date().toISOString().split("T")[0];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onSelectDate(todayStr);
  };

  // Compute days in current month
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarCells: Array<{
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
  }> = [];

  // Previous month padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const mStr = String(prevMonth + 1).padStart(2, "0");
    const dStr = String(d).padStart(2, "0");
    calendarCells.push({
      dateStr: `${prevYear}-${mStr}-${dStr}`,
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const mStr = String(viewMonth + 1).padStart(2, "0");
    const dStr = String(d).padStart(2, "0");
    calendarCells.push({
      dateStr: `${viewYear}-${mStr}-${dStr}`,
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Next month padding to fill complete weeks (multiples of 7)
  const remaining = 7 - (calendarCells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const mStr = String(nextMonth + 1).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      calendarCells.push({
        dateStr: `${nextYear}-${mStr}-${dStr}`,
        dayNum: d,
        isCurrentMonth: false,
      });
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Calendar Header */}
      <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-farm-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-2 py-1 text-[11px] font-semibold text-farm-700 hover:text-farm-800 bg-farm-50 hover:bg-farm-100 rounded-md border border-farm-200 transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-md text-slate-600 hover:bg-slate-200 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-md text-slate-600 hover:bg-slate-200 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day of Week Headers */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/40 text-center py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        {DAY_NAMES.map((name) => (
          <div key={name}>{name}</div>
        ))}
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 p-2 gap-1">
        {calendarCells.map((cell) => {
          const isSelected = cell.dateStr === selectedDate;
          const isToday = cell.dateStr === todayStr;
          const activity = activityByDate[cell.dateStr];
          const hasWater = activity && activity.waterCount > 0;
          const hasSpray = activity && activity.pesticideCount > 0;
          const hasExpense = activity && activity.expenseCount > 0;

          return (
            <button
              key={cell.dateStr}
              type="button"
              onClick={() => onSelectDate(cell.dateStr)}
              className={`min-h-[58px] sm:min-h-[64px] p-1.5 rounded-lg text-left flex flex-col justify-between transition-all relative border ${
                isSelected
                  ? "bg-farm-50/90 border-farm-500 ring-2 ring-farm-500/30 shadow-xs"
                  : isToday
                  ? "bg-sky-50/50 border-sky-300 hover:bg-sky-50"
                  : cell.isCurrentMonth
                  ? "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50/80"
                  : "bg-slate-50/40 border-transparent text-slate-300 hover:bg-slate-100/50"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-bold leading-none ${
                    isSelected
                      ? "text-farm-800 font-black"
                      : isToday
                      ? "text-sky-700 font-extrabold"
                      : cell.isCurrentMonth
                      ? "text-slate-700"
                      : "text-slate-300"
                  }`}
                >
                  {cell.dayNum}
                </span>

                {isToday && (
                  <span className="text-[9px] font-extrabold px-1 py-0.2 bg-sky-600 text-white rounded">
                    TODAY
                  </span>
                )}
              </div>

              {/* Activity Indicators */}
              <div className="flex flex-wrap items-center gap-1 mt-1">
                {hasWater && (
                  <span
                    className="inline-flex items-center px-1 py-0.5 rounded bg-water-100 text-water-800 text-[9px] font-bold"
                    title={`Water: ${activity.waterLiters.toLocaleString()} L`}
                  >
                    <Droplets className="h-2.5 w-2.5 mr-0.5 text-water-600" />
                    <span className="hidden sm:inline">{(activity.waterLiters / 1000).toFixed(0)}k</span>
                  </span>
                )}

                {hasSpray && (
                  <span
                    className="inline-flex items-center px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold"
                    title={`Spray: ${activity.pesticideCount} treatments`}
                  >
                    <FlaskConical className="h-2.5 w-2.5 text-emerald-700" />
                  </span>
                )}

                {hasExpense && (
                  <span
                    className="inline-flex items-center px-1 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold"
                    title={`Spend: ₹${activity.expenseAmount.toLocaleString()}`}
                  >
                    <span className="font-mono">₹</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Calendar Activity Legend */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
        <span className="font-semibold text-slate-500">Legend:</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-water-500"></span>
            <span>Water Run (L)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Chemical Spray</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <span>Daily Spend (₹)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
