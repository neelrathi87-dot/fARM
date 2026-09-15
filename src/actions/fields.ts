"use server";

import { prisma } from "@/lib/prisma";
import { fieldSchema, FieldInput } from "@/lib/validations/schemas";
import { revalidatePath } from "next/cache";

export async function getFields() {
  try {
    const fields = await prisma.field.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            waterLogs: true,
            pesticideLogs: true,
            dailyExpenses: true,
          },
        },
        waterLogs: {
          select: {
            volumeLiters: true,
            waterType: true,
          },
        },
        dailyExpenses: {
          select: {
            amount: true,
          },
        },
      },
    });

    return fields.map((f) => {
      const totalWaterLiters = f.waterLogs.reduce((acc, curr) => acc + curr.volumeLiters, 0);
      const totalExpense = f.dailyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
      return {
        ...f,
        totalWaterLiters,
        totalExpense,
      };
    });
  } catch (error) {
    console.warn("Notice: Unable to fetch fields (database may be offline or migrating). Returning empty list.", error);
    return [];
  }
}

export async function getFieldById(id: string) {
  try {
    return await prisma.field.findUnique({
      where: { id },
      include: {
        waterLogs: {
          orderBy: { date: "desc" },
        },
        pesticideLogs: {
          orderBy: { date: "desc" },
        },
        dailyExpenses: {
          orderBy: { date: "desc" },
        },
      },
    });
  } catch (error) {
    console.warn("Notice: Unable to fetch field by id:", error);
    return null;
  }
}

export async function getFieldsWithFullHistory() {
  try {
    const fields = await prisma.field.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        waterLogs: {
          orderBy: { date: "desc" },
        },
        pesticideLogs: {
          orderBy: { date: "desc" },
        },
        dailyExpenses: {
          orderBy: { date: "desc" },
        },
      },
    });

    return fields.map((f) => {
      const totalWaterLiters = f.waterLogs.reduce((acc, curr) => acc + curr.volumeLiters, 0);
      const totalExpense = f.dailyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
      return {
        ...f,
        totalWaterLiters,
        totalExpense,
      };
    });
  } catch (error) {
    console.warn("Notice: Unable to fetch fields with full history:", error);
    return [];
  }
}

export async function createField(data: FieldInput) {
  try {
    const validated = fieldSchema.parse(data);
    const field = await prisma.field.create({
      data: {
        name: validated.name,
        cropType: validated.cropType,
        areaAcres: validated.areaAcres,
        latitude: validated.latitude,
        longitude: validated.longitude,
        polygonGeoJson: validated.polygonGeoJson || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/fields");
    revalidatePath("/irrigation");
    revalidatePath("/pesticides");
    revalidatePath("/expenses");
    return { success: true, data: field };
  } catch (error: any) {
    console.error("Error creating field:", error);
    return { success: false, error: error.message || "Failed to create field" };
  }
}

export async function updateField(id: string, data: FieldInput) {
  try {
    const validated = fieldSchema.parse(data);
    const field = await prisma.field.update({
      where: { id },
      data: {
        name: validated.name,
        cropType: validated.cropType,
        areaAcres: validated.areaAcres,
        latitude: validated.latitude,
        longitude: validated.longitude,
        polygonGeoJson: validated.polygonGeoJson || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/fields");
    revalidatePath("/irrigation");
    revalidatePath("/pesticides");
    revalidatePath("/expenses");
    return { success: true, data: field };
  } catch (error: any) {
    console.error("Error updating field:", error);
    return { success: false, error: error.message || "Failed to update field" };
  }
}

export async function deleteField(id: string) {
  try {
    await prisma.field.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/fields");
    revalidatePath("/irrigation");
    revalidatePath("/pesticides");
    revalidatePath("/expenses");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting field:", error);
    return { success: false, error: error.message || "Failed to delete field" };
  }
}
