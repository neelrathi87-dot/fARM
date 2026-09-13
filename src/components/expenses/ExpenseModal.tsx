"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createExpense } from "@/actions/expenses";
import { DailyExpenseInput } from "@/lib/validations/schemas";
import { Receipt, Users, Fuel, Wrench, Sprout, DollarSign, Calculator } from "lucide-react";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: Array<{ id: string; name: string; cropType: string; areaAcres?: number }>;
  defaultFieldId?: string;
  defaultDate?: string;
  onSuccess?: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  fields,
  defaultFieldId,
  defaultDate,
  onSuccess,
}) => {
  const [fieldId, setFieldId] = useState<string>(defaultFieldId || (fields[0]?.id ?? ""));
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState<"LABOUR" | "FUEL" | "PESTICIDES" | "MAINTENANCE" | "OTHER">("LABOUR");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitRate, setUnitRate] = useState<number>(0);

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

  // When quantity or unitRate changes in calculators, auto-update amount
  const handleQuantityRateChange = (q: number, rate: number) => {
    setQuantity(q);
    setUnitRate(rate);
    if (q > 0 && rate > 0) {
      setAmount(Number((q * rate).toFixed(2)));
    }
  };

  const handleCategoryChange = (cat: typeof category) => {
    setCategory(cat);
    if (cat === "LABOUR") {
      setDescription("Manual weeding & field upkeep crew");
      setQuantity(5);
      setUnitRate(450);
      setAmount(2250);
    } else if (cat === "FUEL") {
      setDescription("Tractor diesel fuel fill");
      setQuantity(30);
      setUnitRate(92);
      setAmount(2760);
    } else if (cat === "PESTICIDES") {
      setDescription("Input chemicals / biological spray material");
      setQuantity(1);
      setUnitRate(0);
      setAmount(0);
    } else if (cat === "MAINTENANCE") {
      setDescription("Drip irrigation lateral pipe & valve replacement");
      setQuantity(1);
      setUnitRate(0);
      setAmount(0);
    } else {
      setDescription("General operational expense");
      setQuantity(1);
      setUnitRate(0);
      setAmount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldId) {
      setError("Please select a target plot for this expense");
      return;
    }
    if (amount <= 0) {
      setError("Please enter a valid expense amount greater than 0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: DailyExpenseInput = {
        fieldId,
        date,
        category,
        amount,
        quantity: quantity || undefined,
        unitRate: unitRate || undefined,
        description: description.trim(),
      };

      const res = await createExpense(payload);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Failed to log expense");
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
      title="Daily Farm Expenditure"
      subtitle="Track operational burn-rate for labour, diesel fuel, inputs, and maintenance"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        {/* Category Selector Tabs */}
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-900 text-xs">Expense Category</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {[
              { id: "LABOUR", label: "Labour", icon: Users },
              { id: "FUEL", label: "Fuel", icon: Fuel },
              { id: "PESTICIDES", label: "Inputs", icon: Sprout },
              { id: "MAINTENANCE", label: "Repair", icon: Wrench },
              { id: "OTHER", label: "Other", icon: Receipt },
            ].map((c) => {
              const Icon = c.icon;
              const isSelected = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategoryChange(c.id as any)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center font-medium transition-all ${
                    isSelected
                      ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20 shadow-xs font-bold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`h-4 w-4 mb-1 ${isSelected ? "text-amber-600" : "text-slate-400"}`} />
                  <span className="text-[11px]">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Plot & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Plot</label>
            <select
              required
              value={fieldId}
              onChange={(e) => setFieldId(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-farm-500 outline-none"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.cropType}{f.areaAcres ? ` - ${f.areaAcres} ac` : ""})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date Incurred</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-farm-500 outline-none"
            />
          </div>
        </div>

        {/* Dynamic Calculator based on category */}
        {category === "LABOUR" && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-amber-900 font-bold">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-amber-600" />
                Labour Cost Calculator
              </span>
              <span className="text-[10px] font-mono uppercase">Headcount × Daily Wage</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Worker Headcount</label>
                <input
                  type="number"
                  min="1"
                  value={quantity || ""}
                  onChange={(e) =>
                    handleQuantityRateChange(parseFloat(e.target.value) || 0, unitRate)
                  }
                  className="w-full h-9 px-2.5 font-mono border border-slate-300 rounded-md bg-white text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Wage / Head (₹ INR)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={unitRate || ""}
                  onChange={(e) =>
                    handleQuantityRateChange(quantity, parseFloat(e.target.value) || 0)
                  }
                  className="w-full h-9 px-2.5 font-mono border border-slate-300 rounded-md bg-white text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {category === "FUEL" && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-blue-900 font-bold">
              <span className="flex items-center gap-1.5">
                <Fuel className="h-4 w-4 text-blue-600" />
                Fuel Consumption Calculator
              </span>
              <span className="text-[10px] font-mono uppercase">Liters × Rate/L</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Fuel Quantity (Liters)</label>
                <input
                  type="number"
                  min="1"
                  value={quantity || ""}
                  onChange={(e) =>
                    handleQuantityRateChange(parseFloat(e.target.value) || 0, unitRate)
                  }
                  className="w-full h-9 px-2.5 font-mono border border-slate-300 rounded-md bg-white text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Price / Liter (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={unitRate || ""}
                  onChange={(e) =>
                    handleQuantityRateChange(quantity, parseFloat(e.target.value) || 0)
                  }
                  className="w-full h-9 px-2.5 font-mono border border-slate-300 rounded-md bg-white text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Expense Description</label>
          <input
            type="text"
            required
            placeholder="e.g. 5 workers for drip lateral unclogging and weeding"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-farm-500 outline-none text-slate-900"
          />
        </div>

        {/* Total Cost Input */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span>Total Expense Amount (₹ INR)</span>
            {(category === "LABOUR" || category === "FUEL") && (
              <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                <Calculator className="h-3 w-3" /> Auto-computed or override
              </span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 font-bold text-slate-500 text-sm">₹</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full h-10 pl-9 pr-3 text-base font-extrabold font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-farm-500 outline-none text-slate-900"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={loading}>
            Save Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
};
