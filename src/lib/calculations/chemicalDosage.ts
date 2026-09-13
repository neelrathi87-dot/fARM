export type FormulationType = "LIQUID" | "DRY_POWDER";

export type DosageUnit = "ML_PER_L" | "L_PER_L" | "G_PER_L" | "KG_PER_L";

export interface DosageCalculationResult {
  rawAmount: number;
  rawUnit: "mL" | "L" | "g" | "kg";
  normalizedAmount: number;
  normalizedUnit: "mL" | "L" | "g" | "kg";
  displayBadge: string;
  summaryText: string;
}

export const DOSAGE_UNITS_BY_FORMULATION: Record<FormulationType, { value: DosageUnit; label: string; placeholder: string }[]> = {
  LIQUID: [
    { value: "ML_PER_L", label: "mL / Liter (Standard Liquid)", placeholder: "e.g. 2.5" },
    { value: "L_PER_L", label: "L / Liter (Bulk Liquid)", placeholder: "e.g. 0.005" },
  ],
  DRY_POWDER: [
    { value: "G_PER_L", label: "g / Liter (Standard Powder)", placeholder: "e.g. 2.0" },
    { value: "KG_PER_L", label: "kg / Liter (Bulk Granular)", placeholder: "e.g. 0.002" },
  ],
};

/**
 * Calculates net active chemical consumption dynamically from spray volume and dosage rate.
 * Handles pure SI unit conversion and auto-normalizes scalable display units (mL <-> L, g <-> kg).
 */
export function calculateChemicalDosage(
  sprayVolumeLiters: number,
  dosageRate: number,
  dosageUnit: DosageUnit
): DosageCalculationResult {
  if (isNaN(sprayVolumeLiters) || sprayVolumeLiters <= 0 || isNaN(dosageRate) || dosageRate <= 0) {
    return {
      rawAmount: 0,
      rawUnit: dosageUnit === "G_PER_L" || dosageUnit === "KG_PER_L" ? "g" : "mL",
      normalizedAmount: 0,
      normalizedUnit: dosageUnit === "G_PER_L" || dosageUnit === "KG_PER_L" ? "g" : "mL",
      displayBadge: "0.00",
      summaryText: "Enter volume and dosage to compute chemical requirement",
    };
  }

  let rawAmount = 0;
  let rawUnit: "mL" | "L" | "g" | "kg" = "mL";
  let normalizedAmount = 0;
  let normalizedUnit: "mL" | "L" | "g" | "kg" = "mL";

  switch (dosageUnit) {
    case "ML_PER_L": {
      rawAmount = sprayVolumeLiters * dosageRate; // in mL
      rawUnit = "mL";
      if (rawAmount >= 1000) {
        normalizedAmount = Number((rawAmount / 1000).toFixed(3));
        normalizedUnit = "L";
      } else {
        normalizedAmount = Number(rawAmount.toFixed(2));
        normalizedUnit = "mL";
      }
      break;
    }
    case "L_PER_L": {
      const liters = sprayVolumeLiters * dosageRate; // in L
      rawAmount = liters;
      rawUnit = "L";
      if (liters < 1.0) {
        normalizedAmount = Number((liters * 1000).toFixed(2));
        normalizedUnit = "mL";
      } else {
        normalizedAmount = Number(liters.toFixed(3));
        normalizedUnit = "L";
      }
      break;
    }
    case "G_PER_L": {
      rawAmount = sprayVolumeLiters * dosageRate; // in grams
      rawUnit = "g";
      if (rawAmount >= 1000) {
        normalizedAmount = Number((rawAmount / 1000).toFixed(3));
        normalizedUnit = "kg";
      } else {
        normalizedAmount = Number(rawAmount.toFixed(2));
        normalizedUnit = "g";
      }
      break;
    }
    case "KG_PER_L": {
      const kgs = sprayVolumeLiters * dosageRate; // in kg
      rawAmount = kgs;
      rawUnit = "kg";
      if (kgs < 1.0) {
        normalizedAmount = Number((kgs * 1000).toFixed(2));
        normalizedUnit = "g";
      } else {
        normalizedAmount = Number(kgs.toFixed(3));
        normalizedUnit = "kg";
      }
      break;
    }
  }

  const badge = `${normalizedAmount.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 3,
  })} ${normalizedUnit}`;

  let summaryText = `Requires ${badge} of active chemical for ${sprayVolumeLiters.toLocaleString()} L spray mix`;
  if (rawUnit !== normalizedUnit) {
    summaryText += ` (${rawAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${rawUnit} equivalent)`;
  }

  return {
    rawAmount: Number(rawAmount.toFixed(3)),
    rawUnit,
    normalizedAmount,
    normalizedUnit,
    displayBadge: badge,
    summaryText,
  };
}
