"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createWaterLog } from "@/actions/irrigation";
import { WaterLogInput } from "@/lib/validations/schemas";
import {
  calculateDurationMinutes,
  calculateIrrigationVolume,
  formatDuration,
  formatVolume,
} from "@/lib/calculations/irrigationVolume";
import { Droplets, Clock, Sparkles, Check, Info } from "lucide-react";

interface WaterLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: Array<{ id: string; name: string; cropType: string; areaAcres: number }>;
  defaultFieldId?: string;
  defaultDate?: string;
  onSuccess?: () => void;
}

export const WaterLogModal: React.FC<WaterLogModalProps> = ({
  isOpen,
  onClose,
  fields,
  defaultFieldId,
  defaultDate,
  onSuccess,
}) => {
  const [fieldId, setFieldId] = useState(defaultFieldId || (fields[0]?.id ?? ""));
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("08:30");
  const [waterType, setWaterType] = useState<"NORMAL_WATER" | "LIQUID_WATER">("NORMAL_WATER");
  const [deliveryMethod, setDeliveryMethod] = useState<"DRIP" | "SPRINKLER" | "FLOOD">("DRIP");
  const [manualVolume, setManualVolume] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultFieldId && defaultFieldId !== "ALL") {
      setFieldId(defaultFieldId);
    } else if (fields.length > 0 && !fieldId) {
      setFieldId(fields[0].id);
    }
    if (defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultFieldId, defaultDate, fields, fieldId]);

  // Reactive duration & volume calculations (standard baseline 750 L/min for 5HP pump)
  const durationMinutes = calculateDurationMinutes(startTime, endTime);
  const autoVolumeLiters = calculateIrrigationVolume(durationMinutes, 750);
  const effectiveVolume = manualVolume !== null ? manualVolume : autoVolumeLiters;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldId) {
      setError("Please select a plot to irrigate");
      return;
    }
    if (durationMinutes <= 0) {
      setError("End time must be later than start time (duration > 0 min)");
      return;
    }
    if (effectiveVolume <= 0) {
      setError("Water volume must be greater than 0 Liters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const calculatedLpm = durationMinutes > 0 ? Math.round(effectiveVolume / durationMinutes) : 750;
      const payload: WaterLogInput = {
        fieldId,
        date,
        startTime,
        endTime,
        durationMinutes,
        waterType,
        deliveryMethod,
        motorHp: 5.0,
        flowRateLpm: calculatedLpm > 0 ? calculatedLpm : 750,
        volumeLiters: effectiveVolume,
        notes: notes.trim() || undefined,
      };

      const res = await createWaterLog(payload);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Failed to log irrigation event");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dual-Water Irrigation Log"
      subtitle="Record water volume, irrigation duration, and nutrient slurry allocations"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        {/* Target Plot & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Plot / Field</label>
            <select
              required
              value={fieldId}
              onChange={(e) => setFieldId(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-farm-500 outline-none"
            >
              <option value="" disabled>
                Select a field...
              </option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.cropType} - {f.areaAcres} ac)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Application Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-farm-500 outline-none"
            />
          </div>
        </div>

        {/* Strict Dual-Water Categorization Toggle */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <label className="block font-bold text-slate-900 text-xs flex items-center justify-between">
            <span>Water Categorization Engine</span>
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
              Strict Separation
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWaterType("NORMAL_WATER")}
              className={`p-3 rounded-lg border text-left transition-all ${
                waterType === "NORMAL_WATER"
                  ? "bg-water-50 border-water-500 ring-2 ring-water-500/20 shadow-xs"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Droplets className="h-4 w-4 text-water-600" />
                  Normal Water
                </span>
                {waterType === "NORMAL_WATER" && (
                  <Check className="h-4 w-4 text-water-600 stroke-[3]" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Tube well, borewell, canal, or rainwater harvest reservoir.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setWaterType("LIQUID_WATER")}
              className={`p-3 rounded-lg border text-left transition-all ${
                waterType === "LIQUID_WATER"
                  ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Liquid Water
                </span>
                {waterType === "LIQUID_WATER" && (
                  <Check className="h-4 w-4 text-emerald-600 stroke-[3]" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Nutrient solution, fertigation, bio-slurry, or liquid compost extract.
              </p>
            </button>
          </div>
        </div>

        {/* Operating Window: Start & End Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              Pump Start Time
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-10 px-3 font-mono border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-farm-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              Pump End Time
            </label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full h-10 px-3 font-mono border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-farm-500 outline-none"
            />
          </div>
        </div>

        {/* Delivery Method */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Delivery System</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "DRIP", label: "Drip Line" },
              { id: "SPRINKLER", label: "Sprinkler" },
              { id: "FLOOD", label: "Furrow / Flood" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setDeliveryMethod(m.id as any)}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                  deliveryMethod === m.id
                    ? "bg-water-600 text-white border-water-600 font-bold shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Water Volume (Liters) */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="block font-bold text-slate-800 flex items-center gap-1.5">
              <Droplets className="h-4 w-4 text-water-600" />
              Water Volume (Liters)
            </label>
            {manualVolume !== null && (
              <button
                type="button"
                onClick={() => setManualVolume(null)}
                className="text-[11px] font-bold text-farm-600 hover:text-farm-700 hover:underline"
              >
                Auto-calculate from duration
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type="number"
              min="1"
              step="any"
              required
              value={manualVolume !== null ? manualVolume : autoVolumeLiters}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setManualVolume(isNaN(val) ? 0 : val);
              }}
              className="w-full h-10 px-3 pr-14 font-mono text-sm font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-farm-500 outline-none"
              placeholder="e.g. 5000"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
              Liters
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            {manualVolume !== null
              ? "Custom volume set. Click 'Auto-calculate' to calculate based on pump runtime."
              : `Auto-computed based on ${formatDuration(durationMinutes)} duration. You can edit this volume directly.`}
          </p>
        </div>

        {/* Summary Badge */}
        <div className="p-3.5 bg-water-50/90 border border-water-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-water-700">
              Total Water Applied
            </span>
            <span className="text-base font-extrabold text-water-900">
              {formatVolume(effectiveVolume)}
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-water-700">
              Run Duration
            </span>
            <span className="text-base font-extrabold text-water-900">
              {formatDuration(durationMinutes)}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Field Notes / Slurry Recipe</label>
          <input
            type="text"
            placeholder="e.g. Injected 20L liquid seaweed extract into venturi manifold"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-farm-500 outline-none text-slate-900"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={loading}>
            Save Irrigation Event
          </Button>
        </div>
      </form>
    </Modal>
  );
};
