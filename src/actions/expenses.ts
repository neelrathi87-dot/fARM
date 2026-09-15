"use server";

import { prisma } from "@/lib/prisma";
import { dailyExpenseSchema, DailyExpenseInput } from "@/lib/validations/schemas";
import { revalidatePath } from "next/cache";

export async function getExpenses(fieldId?: string) {
  try {
    const where: any = {};
    if (fieldId && fieldId !== "ALL") {
      where.fieldId = fieldId;
    }

    return await prisma.dailyExpense.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        field: {
          select: {
            id: true,
            name: true,
            cropType: true,
          },
        },
      },
    });
  } catch (error) {
    console.warn("Notice: Unable to fetch expenses:", error);
    return [];
  }
}

export async function getExpenseAnalytics(fieldId?: string) {
  try {
    const where: any = {};
    if (fieldId && fieldId !== "ALL") {
      where.fieldId = fieldId;
    }

    const expenses = await prisma.dailyExpense.findMany({
      where,
      include: {
        field: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    let totalAmount = 0;
    const categoryTotals: Record<string, number> = {
      LABOUR: 0,
      PESTICIDES: 0,
      FUEL: 0,
      MAINTENANCE: 0,
      OTHER: 0,
    };

    const fieldTotals: Record<string, { name: string; amount: number }> = {};
    const dailyTotals: Record<string, number> = {};

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let currentMonthSpend = 0;

    for (const exp of expenses) {
      totalAmount += exp.amount;

      // Category breakdown
      if (categoryTotals[exp.category] !== undefined) {
        categoryTotals[exp.category] += exp.amount;
      }

      // Field breakdown
      const fieldKey = exp.fieldId || "FARM_WIDE";
      const fieldName = exp.field?.name || "Farm-Wide / General";
      if (!fieldTotals[fieldKey]) {
        fieldTotals[fieldKey] = { name: fieldName, amount: 0 };
      }
      fieldTotals[fieldKey].amount += exp.amount;

      // Daily total
      const dateKey = exp.date.toISOString().split("T")[0];
      dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + exp.amount;

      // Current month spend for burn-rate
      const expDate = new Date(exp.date);
      if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
        currentMonthSpend += exp.amount;
      }
    }

    // Days elapsed in current month
    const daysElapsed = Math.max(1, now.getDate());
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyAverageBurnRate = currentMonthSpend / daysElapsed;
    const projectedMonthlyBurn = dailyAverageBurnRate * daysInMonth;

    return {
      totalAmount,
      currentMonthSpend,
      projectedMonthlyBurn: Number(projectedMonthlyBurn.toFixed(2)),
      dailyAverageBurnRate: Number(dailyAverageBurnRate.toFixed(2)),
      categoryTotals,
      fieldTotals: Object.values(fieldTotals).sort((a, b) => b.amount - a.amount),
      recentDailyExpenses: Object.entries(dailyTotals)
        .slice(0, 14)
        .map(([date, amount]) => ({ date, amount })),
      count: expenses.length,
    };
  } catch (error) {
    console.warn("Notice: Unable to compute expense analytics:", error);
    return {
      totalAmount: 0,
      currentMonthSpend: 0,
      projectedMonthlyBurn: 0,
      dailyAverageBurnRate: 0,
      categoryTotals: {
        LABOUR: 0,
        PESTICIDES: 0,
        FUEL: 0,
        MAINTENANCE: 0,
        OTHER: 0,
      },
      fieldTotals: [],
      recentDailyExpenses: [],
      count: 0,
    };
  }
}

export async function createExpense(data: DailyExpenseInput) {
  try {
    const validated = dailyExpenseSchema.parse(data);

    const expense = await prisma.dailyExpense.create({
      data: {
        fieldId: validated.fieldId ? validated.fieldId : null,
        date: new Date(validated.date),
        category: validated.category,
        amount: validated.amount,
        quantity: validated.quantity ?? null,
        unitRate: validated.unitRate ?? null,
        description: validated.description,
      },
    });

    revalidatePath("/");
    revalidatePath("/expenses");
    revalidatePath("/fields");
    return { success: true, data: expense };
  } catch (error: any) {
    console.error("Error creating expense:", error);
    return { success: false, error: error.message || "Failed to create expense" };
  }
}

export async function deleteExpense(id: string) {
  try {
    await prisma.dailyExpense.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/expenses");
    revalidatePath("/fields");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting expense:", error);
    return { success: false, error: error.message || "Failed to delete expense" };
  }
}
