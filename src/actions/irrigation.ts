"use server";

import { prisma } from "@/lib/prisma";
import { waterLogSchema, WaterLogInput } from "@/lib/validations/schemas";
import { calculateDurationMinutes, calculateIrrigationVolume } from "@/lib/calculations/irrigationVolume";
import { revalidatePath } from "next/cache";

export async function getWaterLogs(fieldId?: string) {
  try {
    const where = fieldId && fieldId !== "ALL" ? { fieldId } : {};
    return await prisma.waterLog.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        field: {
          select: {
            id: true,
            name: true,
            cropType: true,
            areaAcres: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching water logs:", error);
    throw new Error("Failed to fetch water logs");
  }
}

export async function getIrrigationStats(fieldId?: string) {
  try {
    const where = fieldId && fieldId !== "ALL" ? { fieldId } : {};
    const logs = await prisma.waterLog.findMany({
      where,
      select: {
        volumeLiters: true,
        waterType: true,
        deliveryMethod: true,
        durationMinutes: true,
      },
    });

    let normalWaterLiters = 0;
    let liquidWaterLiters = 0;
    let totalMinutes = 0;

    const deliveryBreakdown: Record<string, number> = {
      DRIP: 0,
      SPRINKLER: 0,
      FLOOD: 0,
    };

    for (const log of logs) {
      if (log.waterType === "NORMAL_WATER") {
        normalWaterLiters += log.volumeLiters;
      } else {
        liquidWaterLiters += log.volumeLiters;
      }
      totalMinutes += log.durationMinutes;
      if (deliveryBreakdown[log.deliveryMethod] !== undefined) {
        deliveryBreakdown[log.deliveryMethod] += log.volumeLiters;
      }
    }

    const totalLiters = normalWaterLiters + liquidWaterLiters;

    return {
      totalLiters,
      normalWaterLiters,
      liquidWaterLiters,
      totalHours: Number((totalMinutes / 60).toFixed(1)),
      logCount: logs.length,
      deliveryBreakdown,
    };
  } catch (error) {
    console.error("Error calculating irrigation stats:", error);
    throw new Error("Failed to calculate irrigation stats");
  }
}

export async function createWaterLog(data: WaterLogInput) {
  try {
    const validated = waterLogSchema.parse(data);

    // Compute duration & volume safely using pure calculation helper
    const duration = calculateDurationMinutes(validated.startTime, validated.endTime);
    const volume = calculateIrrigationVolume(duration, validated.flowRateLpm);

    const log = await prisma.waterLog.create({
      data: {
        fieldId: validated.fieldId,
        date: new Date(validated.date),
        startTime: validated.startTime,
        endTime: validated.endTime,
        durationMinutes: duration > 0 ? duration : validated.durationMinutes,
        waterType: validated.waterType,
        deliveryMethod: validated.deliveryMethod,
        motorHp: validated.motorHp,
        flowRateLpm: validated.flowRateLpm,
        volumeLiters: volume > 0 ? volume : validated.volumeLiters,
        notes: validated.notes || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/irrigation");
    revalidatePath("/fields");
    return { success: true, data: log };
  } catch (error: any) {
    console.error("Error creating water log:", error);
    return { success: false, error: error.message || "Failed to create water log" };
  }
}

export async function deleteWaterLog(id: string) {
  try {
    await prisma.waterLog.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/irrigation");
    revalidatePath("/fields");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting water log:", error);
    return { success: false, error: error.message || "Failed to delete water log" };
  }
}
