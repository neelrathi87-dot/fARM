import React from "react";
import { getFields } from "@/actions/fields";
import { getExpenses, getExpenseAnalytics } from "@/actions/expenses";
import { ExpensesView } from "@/components/expenses/ExpensesView";

export const revalidate = 0;

export default async function ExpensesPage() {
  const fields = await getFields();
  const expenses = await getExpenses();
  const analytics = await getExpenseAnalytics();

  return (
    <ExpensesView
      fields={fields}
      initialExpenses={expenses}
      initialAnalytics={analytics}
    />
  );
}
