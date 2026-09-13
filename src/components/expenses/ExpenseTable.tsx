"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { deleteExpense } from "@/actions/expenses";
import { Users, Fuel, Sprout, Wrench, Receipt, Trash2 } from "lucide-react";

interface ExpenseItem {
  id: string;
  fieldId: string | null;
  field: {
    id: string;
    name: string;
    cropType: string;
  } | null;
  date: Date | string;
  category: string;
  amount: number;
  quantity?: number | null;
  unitRate?: number | null;
  description: string;
}

interface ExpenseTableProps {
  expenses: ExpenseItem[];
  onRefresh?: () => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, onRefresh }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this expense entry?")) {
      setDeletingId(id);
      try {
        await deleteExpense(id);
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "LABOUR":
        return (
          <Badge variant="warning" size="sm" className="font-semibold">
            <Users className="h-3 w-3 text-amber-700" /> Labour
          </Badge>
        );
      case "FUEL":
        return (
          <Badge variant="water" size="sm" className="font-semibold">
            <Fuel className="h-3 w-3 text-sky-700" /> Fuel
          </Badge>
        );
      case "PESTICIDES":
        return (
          <Badge variant="farm" size="sm" className="font-semibold">
            <Sprout className="h-3 w-3 text-emerald-700" /> Inputs
          </Badge>
        );
      case "MAINTENANCE":
        return (
          <Badge variant="neutral" size="sm" className="font-semibold">
            <Wrench className="h-3 w-3 text-slate-700" /> Maintenance
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" size="sm" className="font-semibold">
            <Receipt className="h-3 w-3 text-slate-600" /> Other
          </Badge>
        );
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
        <Receipt className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-800">No Operational Expenses Logged</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Start recording labour, fuel, inputs, and maintenance bills to monitor the farm burn rate.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          <tr>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Allocation</th>
            <th className="py-3 px-4">Description</th>
            <th className="py-3 px-4">Qty & Rate</th>
            <th className="py-3 px-4 text-right">Amount</th>
            <th className="py-3 px-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {expenses.map((exp) => (
            <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                {formatDate(exp.date)}
              </td>

              <td className="py-3 px-4 whitespace-nowrap">{getCategoryBadge(exp.category)}</td>

              <td className="py-3 px-4 whitespace-nowrap">
                {exp.field ? (
                  <div>
                    <span className="font-bold text-slate-900">{exp.field.name}</span>
                    <span className="block text-[10px] text-slate-400">{exp.field.cropType}</span>
                  </div>
                ) : (
                  <span className="text-slate-500 italic">Farm-Wide / Overhead</span>
                )}
              </td>

              <td className="py-3 px-4 text-slate-700 font-medium max-w-xs truncate">
                {exp.description}
              </td>

              <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                {exp.quantity && exp.unitRate ? (
                  <span>
                    {exp.quantity} × ₹{exp.unitRate}
                  </span>
                ) : (
                  "-"
                )}
              </td>

              <td className="py-3 px-4 whitespace-nowrap text-right font-extrabold text-slate-900 font-mono text-sm">
                {formatCurrency(exp.amount)}
              </td>

              <td className="py-3 px-4 text-center whitespace-nowrap">
                <button
                  type="button"
                  disabled={deletingId === exp.id}
                  onClick={() => handleDelete(exp.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
