"use client";

import React, { useState, useMemo } from "react";
import { FieldModal } from "./FieldModal";
import { WaterLogModal } from "@/components/irrigation/WaterLogModal";
import { PesticideModal } from "@/components/pesticides/PesticideModal";
import { ExpenseModal } from "@/components/expenses/ExpenseModal";
import { FieldMapWrapper } from "./FieldMapWrapper";
import { PlotCalendar, DayActivitySummary } from "./PlotCalendar";
import { PlotDailyOperations } from "./PlotDailyOperations";
import { PlotTimelineHistory } from "./PlotTimelineHistory";
import { Button } from "@/components/ui/Button";
import { formatVolume } from "@/lib/calculations/irrigationVolume";
import { formatCurrency } from "@/lib/utils";
import {
  Sprout,
  PlusCircle,
  MapPin,
  Calendar,
  Droplets,
  FlaskConical,
  Receipt,
  Edit3,
  Layers,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Compass,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface FieldManagerViewProps {
  initialFields: any[];
}

export const FieldManagerView: React.FC<FieldManagerViewProps> = ({ initialFields }) => {
  const router = useRouter();

  // Modals state
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState<any | null>(null);

  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const [pesticideModalOpen, setPesticideModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  // Selected plot and selected date
  const [selectedFieldId, setSelectedFieldId] = useState<string>(
    initialFields[0]?.id || ""
  );

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [showMap, setShowMap] = useState<boolean>(false);

  const activeField = useMemo(() => {
    return initialFields.find((f) => f.id === selectedFieldId) || initialFields[0] || null;
  }, [initialFields, selectedFieldId]);

  // Map all activities for activeField by date string (YYYY-MM-DD)
  const activityByDate = useMemo(() => {
    const map: Record<
      string,
      {
        waterLogs: any[];
        pesticideLogs: any[];
        expenses: any[];
        totalWaterLiters: number;
        totalExpense: number;
        waterLiters: number;
        waterCount: number;
        pesticideCount: number;
        expenseAmount: number;
        expenseCount: number;
      }
    > = {};

    if (!activeField) return map;

    // Water logs
    activeField.waterLogs?.forEach((w: any) => {
      const d = new Date(w.date).toISOString().split("T")[0];
      if (!map[d]) {
        map[d] = {
          waterLogs: [],
          pesticideLogs: [],
          expenses: [],
          totalWaterLiters: 0,
          totalExpense: 0,
          waterLiters: 0,
          waterCount: 0,
          pesticideCount: 0,
          expenseAmount: 0,
          expenseCount: 0,
        };
      }
      map[d].waterLogs.push(w);
      map[d].totalWaterLiters += w.volumeLiters || 0;
      map[d].waterLiters += w.volumeLiters || 0;
      map[d].waterCount += 1;
    });

    // Pesticide logs
    activeField.pesticideLogs?.forEach((p: any) => {
      const d = new Date(p.date).toISOString().split("T")[0];
      if (!map[d]) {
        map[d] = {
          waterLogs: [],
          pesticideLogs: [],
          expenses: [],
          totalWaterLiters: 0,
          totalExpense: 0,
          waterLiters: 0,
          waterCount: 0,
          pesticideCount: 0,
          expenseAmount: 0,
          expenseCount: 0,
        };
      }
      map[d].pesticideLogs.push(p);
      map[d].pesticideCount += 1;
    });

    // Daily expenses
    activeField.dailyExpenses?.forEach((e: any) => {
      const d = new Date(e.date).toISOString().split("T")[0];
      if (!map[d]) {
        map[d] = {
          waterLogs: [],
          pesticideLogs: [],
          expenses: [],
          totalWaterLiters: 0,
          totalExpense: 0,
          waterLiters: 0,
          waterCount: 0,
          pesticideCount: 0,
          expenseAmount: 0,
          expenseCount: 0,
        };
      }
      map[d].expenses.push(e);
      map[d].totalExpense += e.amount || 0;
      map[d].expenseAmount += e.amount || 0;
      map[d].expenseCount += 1;
    });

    return map;
  }, [activeField]);

  // Selected day's activities
  const selectedDayActivity = useMemo(() => {
    return (
      activityByDate[selectedDate] || {
        waterLogs: [],
        pesticideLogs: [],
        expenses: [],
        totalWaterLiters: 0,
        totalExpense: 0,
        waterLiters: 0,
        waterCount: 0,
        pesticideCount: 0,
        expenseAmount: 0,
        expenseCount: 0,
      }
    );
  }, [activityByDate, selectedDate]);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleOpenEditField = () => {
    if (activeField) {
      setFieldToEdit(activeField);
      setFieldModalOpen(true);
    }
  };

  const handleCreateNewField = () => {
    setFieldToEdit(null);
    setFieldModalOpen(true);
  };

  // Convert for PlotCalendar
  const calendarActivitySummary: Record<string, DayActivitySummary> = useMemo(() => {
    const summary: Record<string, DayActivitySummary> = {};
    Object.keys(activityByDate).forEach((dateKey) => {
      const a = activityByDate[dateKey];
      summary[dateKey] = {
        waterLiters: a.totalWaterLiters,
        waterCount: a.waterLogs.length,
        pesticideCount: a.pesticideLogs.length,
        expenseAmount: a.totalExpense,
        expenseCount: a.expenses.length,
      };
    });
    return summary;
  }, [activityByDate]);

  return (
    <div className="space-y-6">
      {/* CASE 1: NO PLOTS REGISTERED YET (ONE-TIME SETUP ONBOARDING) */}
      {initialFields.length === 0 ? (
        <div className="max-w-2xl mx-auto my-8 bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-farm-100 text-farm-700 rounded-2xl shadow-inner">
              <Sprout className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Set Up Your Farm Plot Once</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Register your agricultural plot once. You will not need to add plots daily! All daily
              water runs, chemical sprays, expenses, and weather telemetry will be tracked directly in
              this plot through your interactive calendar.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CheckCircle2 className="h-4 w-4 text-farm-600" />
              <span>What happens next?</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
              <li>Your plot becomes your permanent farm management command base.</li>
              <li>Every day, open your calendar to log water volume (Liters/mL), spray runs, and costs (₹).</li>
              <li>Atmospheric telemetry and spray drift hazards connect automatically to your location.</li>
            </ul>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full py-3 text-sm font-bold shadow-md cursor-pointer"
            onClick={handleCreateNewField}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Set Up My Plot (One-Time Setup)
          </Button>
        </div>
      ) : (
        /* CASE 2: PLOT EXISTS -> UNIFIED DAILY OPERATIONS & CALENDAR HUB */
        <>
          {/* Top Plot Selector & Operations Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Plot:
                </span>
                {initialFields.map((f) => {
                  const isActive = f.id === activeField.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFieldId(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-farm-600 text-white shadow-xs"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Sprout className="h-3.5 w-3.5" />
                      <span>{f.name}</span>
                      <span className={`text-[10px] ${isActive ? "text-farm-200" : "text-slate-400"}`}>
                        ({f.cropType} • {f.areaAcres} ac)
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={handleCreateNewField}
                  className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Add an additional plot (optional)"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Add Another Plot</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="font-semibold text-slate-800">
                  📍 {activeField.name}: {activeField.cropType} ({activeField.areaAcres} Acres)
                </span>
                <span>•</span>
                <span className="text-water-700 font-semibold font-mono">
                  💧 Total Water: {formatVolume(activeField.totalWaterLiters || 0)}
                </span>
                <span>•</span>
                <span className="text-amber-700 font-semibold font-mono">
                  💰 Total Spend: {formatCurrency(activeField.totalExpense || 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showMap
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>{showMap ? "Hide Satellite Map" : "Show Satellite Map"}</span>
              </button>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${activeField.latitude},${activeField.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Open plot location directly in Google Maps"
              >
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>Google Maps ↗</span>
              </a>

              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenEditField}
                className="cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1" />
                Edit Plot Info
              </Button>
            </div>
          </div>

          {/* Minimizable Satellite / Roadmap Map */}
          {showMap && (
            <div className="h-[380px] rounded-xl overflow-hidden border border-slate-200 shadow-sm animate-in fade-in duration-200">
              <FieldMapWrapper
                fields={initialFields}
                selectedFieldId={activeField.id}
                onSelectField={(id) => setSelectedFieldId(id)}
                center={[activeField.latitude, activeField.longitude]}
                zoom={14}
              />
            </div>
          )}

          {/* Main 2-Column Hub: Left = Daily Operations Command; Right = Monthly Calendar & History */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Daily Operations for Selected Date (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <PlotDailyOperations
                field={activeField}
                selectedDate={selectedDate}
                waterLogs={selectedDayActivity.waterLogs}
                pesticideLogs={selectedDayActivity.pesticideLogs}
                expenses={selectedDayActivity.expenses}
                onOpenWaterModal={() => setWaterModalOpen(true)}
                onOpenPesticideModal={() => setPesticideModalOpen(true)}
                onOpenExpenseModal={() => setExpenseModalOpen(true)}
              />
            </div>

            {/* Right Column: Monthly Calendar & Timeline History (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Calendar Component */}
              <PlotCalendar
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
                activityByDate={calendarActivitySummary}
              />

              {/* Chronological Daily Activity Feed */}
              <PlotTimelineHistory
                activityByDate={activityByDate}
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
              />
            </div>
          </div>
        </>
      )}

      {/* MODAL 1: Field / Plot Create or Edit */}
      <FieldModal
        isOpen={fieldModalOpen}
        onClose={() => {
          setFieldModalOpen(false);
          setFieldToEdit(null);
        }}
        fieldToEdit={fieldToEdit}
        onSuccess={handleRefresh}
      />

      {/* MODAL 2: Water Log Modal (Pre-filled with active plot and selected date!) */}
      {activeField && (
        <WaterLogModal
          isOpen={waterModalOpen}
          onClose={() => setWaterModalOpen(false)}
          fields={initialFields}
          defaultFieldId={activeField.id}
          defaultDate={selectedDate}
          onSuccess={handleRefresh}
        />
      )}

      {/* MODAL 3: Pesticide Spray Modal (Pre-filled with active plot and selected date!) */}
      {activeField && (
        <PesticideModal
          isOpen={pesticideModalOpen}
          onClose={() => setPesticideModalOpen(false)}
          fields={initialFields}
          defaultFieldId={activeField.id}
          defaultDate={selectedDate}
          onSuccess={handleRefresh}
        />
      )}

      {/* MODAL 4: Expense Modal (Pre-filled with active plot and selected date!) */}
      {activeField && (
        <ExpenseModal
          isOpen={expenseModalOpen}
          onClose={() => setExpenseModalOpen(false)}
          fields={initialFields}
          defaultFieldId={activeField.id}
          defaultDate={selectedDate}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};
