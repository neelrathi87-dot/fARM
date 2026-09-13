"use client";

import React, { useState } from "react";
import { ExpenseTable } from "./ExpenseTable";
import { ExpenseModal } from "./ExpenseModal";
import { BurnRateAnalytics } from "./BurnRateAnalytics";
import { Button } from "@/components/ui/Button";
import { Receipt, PlusCircle, Filter, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExpensesViewProps {
  fields: Array<{ id: string; name: string; cropType: string }>;
  initialExpenses: any[];
  initialAnalytics: {
    totalAmount: number;
    currentMonthSpend: number;
    projectedMonthlyBurn: number;
    dailyAverageBurnRate: number;
    categoryTotals: Record<string, number>;
    fieldTotals: Array<{ name: string; amount: number }>;
    recentDailyExpenses: Array<{ date: string; amount: number }>;
    count: number;
  };
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  fields,
  initialExpenses,
  initialAnalytics,
}) => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [filterFieldId, setFilterFieldId] = useState<string>("ALL");

  const filteredExpenses =
    filterFieldId === "ALL"
      ? initialExpenses
      : initialExpenses.filter((e) => e.fieldId === filterFieldId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-amber-600" />
            Daily Expenditures & Operational Burn-Rate
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Granular labour headcount wages, diesel fuel metering, chemical inputs, and machinery maintenance analytics
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-1.5" />
          Log Expenditure
        </Button>
      </div>

      {/* Burn Rate Real-time Analytics Component */}
      <BurnRateAnalytics analytics={initialAnalytics} />

      {/* Filter and Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Filter Plot:</span>
            <select
              value={filterFieldId}
              onChange={(e) => setFilterFieldId(e.target.value)}
              className="h-8 px-2.5 border border-slate-300 rounded-md bg-white text-slate-900 font-medium outline-none focus:ring-1 focus:ring-farm-500"
            >
              <option value="ALL">All Plots ({initialExpenses.length} Records)</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.cropType})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium ml-auto">
            Showing {filteredExpenses.length} recorded entries
          </div>
        </div>

        <ExpenseTable expenses={filteredExpenses} onRefresh={() => router.refresh()} />
      </div>

      {/* Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        fields={fields}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
};
