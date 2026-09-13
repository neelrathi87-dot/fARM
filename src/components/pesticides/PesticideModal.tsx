"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createPesticideBatch } from "@/actions/pesticides";
import {
  FormulationType,
  DosageUnit,
  DOSAGE_UNITS_BY_FORMULATION,
  calculateChemicalDosage,
} from "@/lib/calculations/chemicalDosage";
import {
  FlaskConical,
  Bug,
  Scale,
  Check,
  Tractor,
  Sparkles,
  Droplets,
  Plus,
  Trash2,
  Layers,
} from "lucide-react";

interface PesticideModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: Array<{ id: string; name: string; cropType: string; areaAcres: number }>;
  defaultFieldId?: string;
  defaultDate?: string;
  onSuccess?: () => void;
}

interface TankChemicalItem {
  id: string;
  chemicalName: string;
  targetPest: string;
  formulationType: FormulationType;
  dosageUnit: DosageUnit;
  dosageRate: number;
}

type ApplicationMethod = "TRACTOR" | "FOLIAR" | "DRENCH" | "FERTIGATION";

const APPLICATION_METHODS = [
  { id: "TRACTOR" as ApplicationMethod, label: "Tractor Spray", icon: Tractor, desc: "Blower / boom sprayer" },
  { id: "FOLIAR" as ApplicationMethod, label: "Foliar Spray", icon: Sparkles, desc: "Knapsack / manual spray" },
  { id: "DRENCH" as ApplicationMethod, label: "Root Drench", icon: Droplets, desc: "Soil root zone saturation" },
  { id: "FERTIGATION" as ApplicationMethod, label: "Fertigation Line", icon: FlaskConical, desc: "Drip venturi injection" },
];

const TANK_PRESETS = [200, 500, 1000, 2000];

export const PesticideModal: React.FC<PesticideModalProps> = ({
  isOpen,
  onClose,
  fields,
  defaultFieldId,
  defaultDate,
  onSuccess,
}) => {
  const [fieldId, setFieldId] = useState(defaultFieldId || (fields[0]?.id ?? ""));
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split("T")[0]);
  const [sprayVolumeLiters, setSprayVolumeLiters] = useState<number>(500);
  const [applicationMethod, setApplicationMethod] = useState<ApplicationMethod>("TRACTOR");

  // Dynamic list of chemicals in the tank mix
  const [chemicals, setChemicals] = useState<TankChemicalItem[]>([
    {
      id: "chem-1",
      chemicalName: "",
      targetPest: "",
      formulationType: "LIQUID",
      dosageUnit: "ML_PER_L",
      dosageRate: 2.5,
    },
  ]);

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

  // Add a new chemical to the tank mix list
  const addChemical = () => {
    const isEven = chemicals.length % 2 === 1;
    setChemicals([
      ...chemicals,
      {
        id: `chem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        chemicalName: "",
        targetPest: "",
        formulationType: isEven ? "DRY_POWDER" : "LIQUID",
        dosageUnit: isEven ? "G_PER_L" : "ML_PER_L",
        dosageRate: isEven ? 2.0 : 2.5,
      },
    ]);
  };

  // Remove chemical from list
  const removeChemical = (id: string) => {
    if (chemicals.length > 1) {
      setChemicals(chemicals.filter((c) => c.id !== id));
    }
  };

  // Update specific chemical in list
  const updateChemical = (id: string, updates: Partial<TankChemicalItem>) => {
    setChemicals((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, ...updates };

        // Auto-synchronize default dosage unit if formulation changes
        if (updates.formulationType && updates.formulationType !== c.formulationType) {
          if (updates.formulationType === "LIQUID") {
            updated.dosageUnit = "ML_PER_L";
            if (updated.dosageRate <= 0 || updated.dosageRate > 50) updated.dosageRate = 2.5;
          } else {
            updated.dosageUnit = "G_PER_L";
            if (updated.dosageRate <= 0 || updated.dosageRate > 50) updated.dosageRate = 2.0;
          }
        }
        return updated;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldId) {
      setError("Please select a target plot");
      return;
    }

    if (isNaN(sprayVolumeLiters) || sprayVolumeLiters <= 0) {
      setError("Please enter a valid spray tank volume in Liters");
      return;
    }

    // Validate all chemical rows
    for (let i = 0; i < chemicals.length; i++) {
      const chem = chemicals[i];
      if (!chem.chemicalName.trim()) {
        setError(`Please enter the chemical or trade name for Chemical #${i + 1}`);
        return;
      }
      if (!chem.targetPest.trim()) {
        setError(`Please enter the target pest or purpose for Chemical #${i + 1}`);
        return;
      }
      if (isNaN(chem.dosageRate) || chem.dosageRate <= 0) {
        setError(`Please enter a valid dosage concentration for Chemical #${i + 1}`);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        fieldId,
        date,
        sprayVolumeLiters,
        applicationMethod,
        chemicals: chemicals.map((c) => ({
          chemicalName: c.chemicalName.trim(),
          targetPest: c.targetPest.trim(),
          formulationType: c.formulationType,
          dosageRate: c.dosageRate,
          dosageUnit: c.dosageUnit,
        })),
      };

      const res = await createPesticideBatch(payload);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Failed to log spray application");
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
      title="Pesticide & Chemical Tank Mix Application"
      subtitle="Precision SI multi-chemical tank mix calculator with Tractor Spray and full compliance logging"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        {/* 1. Target Plot & Application Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Plot</label>
            <select
              required
              value={fieldId}
              onChange={(e) => setFieldId(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-farm-500 outline-none"
            >
              <option value="" disabled>
                Select a plot...
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

        {/* 2. Application Method (Featuring Tractor Spray) */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span>Application Method</span>
            <span className="text-[11px] text-slate-500 font-normal">Choose delivery mechanism</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {APPLICATION_METHODS.map((m) => {
              const Icon = m.icon;
              const isSelected = applicationMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setApplicationMethod(m.id)}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                    isSelected
                      ? "bg-farm-600 text-white border-farm-600 shadow-xs ring-2 ring-farm-600/20"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-white" : "text-farm-600"}`} />
                    <span>{m.label}</span>
                  </div>
                  <span
                    className={`block text-[10px] mt-0.5 truncate ${
                      isSelected ? "text-farm-100" : "text-slate-400"
                    }`}
                  >
                    {m.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Spray Tank Volume */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="block font-bold text-slate-800 flex items-center gap-1.5">
              <Droplets className="h-4 w-4 text-water-600" />
              Spray Tank Mix Volume (Liters)
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 mr-1">Quick presets:</span>
              {TANK_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSprayVolumeLiters(preset)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                    sprayVolumeLiters === preset
                      ? "bg-water-600 text-white border-water-600"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {preset} L
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <input
              type="number"
              step="1"
              min="1"
              required
              value={sprayVolumeLiters || ""}
              onChange={(e) => setSprayVolumeLiters(parseFloat(e.target.value) || 0)}
              className="w-full h-10 px-3 pr-14 font-mono text-sm font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-farm-500 outline-none"
              placeholder="e.g. 500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
              Liters
            </div>
          </div>
        </div>

        {/* 4. Multi-Chemical Tank Mix (List Option) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="h-4 w-4 text-emerald-600" />
                Agrochemical Tank Mix ({chemicals.length} {chemicals.length === 1 ? "Product" : "Products"})
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Add multiple fungicides, insecticides, nutrients, or spreaders mixed in this single spray run
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addChemical}
              className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Chemical</span>
            </Button>
          </div>

          <div className="space-y-3">
            {chemicals.map((chem, idx) => {
              const calc = calculateChemicalDosage(sprayVolumeLiters, chem.dosageRate, chem.dosageUnit);
              const isLiquid = chem.formulationType === "LIQUID";

              return (
                <div
                  key={chem.id}
                  className="p-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-2xs space-y-3 transition-colors"
                >
                  {/* Row Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 text-xs">
                        {chem.chemicalName.trim() ? chem.chemicalName : `Chemical #${idx + 1}`}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isLiquid
                            ? "bg-water-100 text-water-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isLiquid ? "Liquid" : "Powder / Granular"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold rounded text-xs flex items-center gap-1">
                        <Scale className="h-3 w-3 text-emerald-600" />
                        <span>Dose: {calc.displayBadge}</span>
                      </span>

                      {chemicals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChemical(chem.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Remove chemical from mix"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chemical Name & Target Pest */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <FlaskConical className="h-3 w-3 text-farm-600" />
                        Active Chemical / Trade Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={
                          idx === 0
                            ? "e.g. Mancozeb 75% WP, Ridomil"
                            : idx === 1
                            ? "e.g. Chlorpyrifos 20% EC, Imidacloprid"
                            : "e.g. Silicon Spreader / Micronutrient tonic"
                        }
                        value={chem.chemicalName}
                        onChange={(e) => updateChemical(chem.id, { chemicalName: e.target.value })}
                        className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-farm-500 outline-none text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <Bug className="h-3 w-3 text-rose-500" />
                        Target Pest / Disease / Purpose
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={
                          idx === 0
                            ? "e.g. Downy Mildew, Anthracnose"
                            : idx === 1
                            ? "e.g. Thrips, Caterpillars, Aphids"
                            : "e.g. Wetting agent, Foliar nutrition"
                        }
                        value={chem.targetPest}
                        onChange={(e) => updateChemical(chem.id, { targetPest: e.target.value })}
                        className="w-full h-9 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-farm-500 outline-none text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Formulation Type & Dosage Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Formulation State</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateChemical(chem.id, { formulationType: "LIQUID" })}
                          className={`py-1.5 px-2 rounded-md border text-center text-[11px] font-bold transition-all ${
                            isLiquid
                              ? "bg-water-50 border-water-500 text-water-800 ring-1 ring-water-500"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          Liquid (EC/SL)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateChemical(chem.id, { formulationType: "DRY_POWDER" })}
                          className={`py-1.5 px-2 rounded-md border text-center text-[11px] font-bold transition-all ${
                            !isLiquid
                              ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          Powder (WP/WDG)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">SI Dosage Unit</label>
                      <select
                        value={chem.dosageUnit}
                        onChange={(e) => updateChemical(chem.id, { dosageUnit: e.target.value as DosageUnit })}
                        className="w-full h-9 px-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-farm-500 outline-none"
                      >
                        {DOSAGE_UNITS_BY_FORMULATION[chem.formulationType].map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Concentration Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={chem.dosageRate || ""}
                        onChange={(e) => updateChemical(chem.id, { dosageRate: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 px-2.5 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-farm-500 outline-none text-slate-900 font-semibold"
                        placeholder="e.g. 2.5"
                      />
                    </div>
                  </div>

                  {/* Calculation Helper Line */}
                  <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-md flex items-center justify-between">
                    <span>
                      Formula requirement for {sprayVolumeLiters} L tank:{" "}
                      <strong className="text-slate-800">{calc.summaryText}</strong>
                    </span>
                    <span className="font-bold text-farm-700 font-mono">{calc.displayBadge}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addChemical}
            className="w-full py-2.5 border-dashed border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4 text-emerald-600" />
            <span>+ Add Another Chemical to Tank Mix</span>
          </Button>
        </div>

        {/* 5. Master Tank Mix Summary */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-farm-50 to-emerald-50 border border-emerald-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-emerald-700 shrink-0" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Master Tank Mix Recipe ({chemicals.length} {chemicals.length === 1 ? "Chemical" : "Chemicals"})
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  Total Tank Volume: <strong>{sprayVolumeLiters} L</strong> • Method:{" "}
                  <strong>{APPLICATION_METHODS.find((m) => m.id === applicationMethod)?.label}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60">
            {chemicals.map((chem, idx) => {
              const calc = calculateChemicalDosage(sprayVolumeLiters, chem.dosageRate, chem.dosageUnit);
              return (
                <div
                  key={chem.id}
                  className="p-2 bg-white/90 rounded-lg border border-emerald-100 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-800 block truncate">
                      {chem.chemicalName || `Chemical #${idx + 1}`}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {chem.dosageRate} {chem.dosageUnit.replace("_", "/")} • {chem.targetPest || "General Treatment"}
                    </span>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 bg-emerald-600 text-white font-mono font-bold rounded text-xs">
                    {calc.displayBadge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={loading}>
            Save Spray Log ({chemicals.length} {chemicals.length === 1 ? "Chemical" : "Chemicals"})
          </Button>
        </div>
      </form>
    </Modal>
  );
};
