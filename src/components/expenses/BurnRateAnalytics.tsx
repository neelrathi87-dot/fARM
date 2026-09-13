"use client";

import React from "react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, Users, Fuel, Sprout, Wrench, Receipt, DollarSign } from "lucide-react";

interface AnalyticsProps {
  analytics: {
    totalAmount: number;
    currentMonthSpend: number;
    projectedMonthlyBurn: number;
    dailyAverageBurnRate: number;
    categoryTotals: Record<string, number>;
    fieldTotals: Array<{ name: string; amount: number }>;
    count: number;
  };
}

export const BurnRateAnalytics: React.FC<AnalyticsProps> = ({ analytics }) => {
  const {
    totalAmount,
    currentMonthSpend,
    projectedMonthlyBurn,
    dailyAverageBurnRate,
    categoryTotals,
    fieldTotals,
  } = analytics;

  const categories = [
    { key: "LABOUR", label: "Labour", color: "bg-amber-500", text: "text-amber-700", icon: Users },
    { key: "FUEL", label: "Fuel & Power", color: "bg-sky-500", text: "text-sky-700", icon: Fuel },
    { key: "PESTICIDES", label: "Inputs & Chemicals", color: "bg-emerald-500", text: "text-emerald-700", icon: Sprout },
    { key: "MAINTENANCE", label: "Equipment Maintenance", color: "bg-slate-500", text: "text-slate-700", icon: Wrench },
    { key: "OTHER", label: "Overhead & General", color: "bg-indigo-500", text: "text-indigo-700", icon: Receipt },
  ];

  return (
    <div className="space-y-4">
      {/* Top Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Current Month Incurred
          </span>
          <div className="text-xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrency(currentMonthSpend)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active billing period</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
            Projected Monthly Burn
          </span>
          <div className="text-xl font-black text-amber-900 mt-1 font-mono">
            {formatCurrency(projectedMonthlyBurn)}
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">
            Run-rate based on active days
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Daily Average Burn
          </span>
          <div className="text-xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrency(dailyAverageBurnRate)}/day
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Operating burn rate</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Farm Spend To-Date
          </span>
          <div className="text-xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrency(totalAmount)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">All logged accounts</span>
        </div>
      </div>

      {/* Category Breakdown & Field-wise Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-farm-600" />
            Operational Expense by Category
          </h4>

          <div className="space-y-3">
            {categories.map((c) => {
              const amount = categoryTotals[c.key] || 0;
              const percent = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
              const Icon = c.icon;
              return (
                <div key={c.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Icon className={`h-3.5 w-3.5 ${c.text}`} />
                      {c.label}
                    </span>
                    <span className="font-mono text-slate-900">
                      {formatCurrency(amount)} ({percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${c.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Field-wise Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-farm-600" />
            Plot & Overhead Cost Allocation
          </h4>

          {fieldTotals.length === 0 ? (
            <p className="text-xs text-slate-400">No field expenses recorded.</p>
          ) : (
            <div className="space-y-3">
              {fieldTotals.map((item, idx) => {
                const percent = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 truncate max-w-[200px]">{item.name}</span>
                      <span className="font-mono text-slate-900">
                        {formatCurrency(item.amount)} ({percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-farm-600 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
