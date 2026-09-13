"use server";

import { prisma } from "@/lib/prisma";
import {
  pesticideLogSchema,
  PesticideLogInput,
  pesticideBatchSchema,
  PesticideBatchInput,
} from "@/lib/validations/schemas";
import { calculateChemicalDosage } from "@/lib/calculations/chemicalDosage";
import { revalidatePath } from "next/cache";

export interface PesticideFilterOptions {
  fieldId?: string;
  search?: string;
  date?: string; // YYYY-MM-DD
}

export async function getPesticideLogs(options?: PesticideFilterOptions) {
  try {
    const { fieldId, search, date } = options || {};

    const where: any = {};

    if (fieldId && fieldId !== "ALL") {
      where.fieldId = fieldId;
    }

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const logs = await prisma.pesticideLog.findMany({
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

    // If search term provided, perform case-insensitive fuzzy filtering on chemical name, target pest, or field name
    if (search && search.trim() !== "") {
      const term = search.toLowerCase().trim();
      return logs.filter(
        (log) =>
          log.chemicalName.toLowerCase().includes(term) ||
          log.targetPest.toLowerCase().includes(term) ||
          log.field.name.toLowerCase().includes(term)
      );
    }

    return logs;
  } catch (error) {
    console.error("Error fetching pesticide logs:", error);
    throw new Error("Failed to fetch pesticide logs");
  }
}

export async function getDailyChemicalRollup(dateStr: string, fieldId?: string) {
  try {
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const where: any = {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    if (fieldId && fieldId !== "ALL") {
      where.fieldId = fieldId;
    }

    const logs = await prisma.pesticideLog.findMany({
      where,
      include: {
        field: {
          select: { name: true },
        },
      },
    });

    let totalLiquidLiters = 0;
    let totalPowderKg = 0;
    let totalSprayMixLiters = 0;

    for (const log of logs) {
      totalSprayMixLiters += log.sprayVolumeLiters;

      if (log.netChemicalUnit === "L") {
        totalLiquidLiters += log.netChemicalAmount;
      } else if (log.netChemicalUnit === "mL") {
        totalLiquidLiters += log.netChemicalAmount / 1000;
      } else if (log.netChemicalUnit === "kg") {
        totalPowderKg += log.netChemicalAmount;
      } else if (log.netChemicalUnit === "g") {
        totalPowderKg += log.netChemicalAmount / 1000;
      }
    }

    return {
      date: dateStr,
      count: logs.length,
      totalSprayMixLiters,
      totalLiquidActiveLiters: Number(totalLiquidLiters.toFixed(3)),
      totalPowderActiveKg: Number(totalPowderKg.toFixed(3)),
      logs,
    };
  } catch (error) {
    console.error("Error computing daily pesticide rollup:", error);
    throw new Error("Failed to compute daily pesticide rollup");
  }
}

export async function createPesticideLog(data: PesticideLogInput) {
  try {
    const validated = pesticideLogSchema.parse(data);

    // Compute dynamic dosage & normalization using pure SI calculation helper
    const calc = calculateChemicalDosage(
      validated.sprayVolumeLiters,
      validated.dosageRate,
      validated.dosageUnit
    );

    const log = await prisma.pesticideLog.create({
      data: {
        fieldId: validated.fieldId,
        date: new Date(validated.date),
        timestamp: new Date(),
        chemicalName: validated.chemicalName,
        targetPest: validated.targetPest,
        formulationType: validated.formulationType,
        dosageRate: validated.dosageRate,
        dosageUnit: validated.dosageUnit,
        sprayVolumeLiters: validated.sprayVolumeLiters,
        netChemicalAmount: calc.normalizedAmount,
        netChemicalUnit: calc.normalizedUnit,
        applicationMethod: validated.applicationMethod,
      },
    });

    revalidatePath("/");
    revalidatePath("/pesticides");
    revalidatePath("/fields");
    return { success: true, data: log };
  } catch (error: any) {
    console.error("Error creating pesticide log:", error);
    return { success: false, error: error.message || "Failed to create pesticide log" };
  }
}

export async function createPesticideBatch(data: PesticideBatchInput) {
  try {
    const validated = pesticideBatchSchema.parse(data);

    const logsToCreate = validated.chemicals.map((chem) => {
      const calc = calculateChemicalDosage(
        validated.sprayVolumeLiters,
        chem.dosageRate,
        chem.dosageUnit
      );

      return {
        fieldId: validated.fieldId,
        date: new Date(validated.date),
        timestamp: new Date(),
        chemicalName: chem.chemicalName.trim(),
        targetPest: chem.targetPest.trim(),
        formulationType: chem.formulationType,
        dosageRate: chem.dosageRate,
        dosageUnit: chem.dosageUnit,
        sprayVolumeLiters: validated.sprayVolumeLiters,
        netChemicalAmount: calc.normalizedAmount,
        netChemicalUnit: calc.normalizedUnit,
        applicationMethod: validated.applicationMethod,
      };
    });

    const logs = await prisma.$transaction(
      logsToCreate.map((item) => prisma.pesticideLog.create({ data: item }))
    );

    revalidatePath("/");
    revalidatePath("/pesticides");
    revalidatePath("/fields");
    return { success: true, count: logs.length, data: logs };
  } catch (error: any) {
    console.error("Error creating pesticide batch:", error);
    return { success: false, error: error.message || "Failed to create pesticide batch" };
  }
}

export async function deletePesticideLog(id: string) {
  try {
    await prisma.pesticideLog.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/pesticides");
    revalidatePath("/fields");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting pesticide log:", error);
    return { success: false, error: error.message || "Failed to delete pesticide log" };
  }
}
