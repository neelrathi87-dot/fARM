import { z } from "zod";

export const fieldSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Field name must be at least 2 characters").max(100),
  cropType: z.string().min(2, "Crop type is required"),
  areaAcres: z.coerce.number().positive("Area in acres must be greater than 0"),
  latitude: z.coerce.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  polygonGeoJson: z.string().optional().nullable(),
});

export type FieldInput = z.infer<typeof fieldSchema>;

export const waterLogSchema = z.object({
  fieldId: z.string().min(1, "Please select a field"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be HH:MM format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be HH:MM format"),
  durationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  waterType: z.enum(["NORMAL_WATER", "LIQUID_WATER"], {
    errorMap: () => ({ message: "Select Normal Water or Liquid Water" }),
  }),
  deliveryMethod: z.enum(["DRIP", "SPRINKLER", "FLOOD"], {
    errorMap: () => ({ message: "Select Drip, Sprinkler, or Flood" }),
  }),
  motorHp: z.coerce.number().default(5.0),
  flowRateLpm: z.coerce.number().positive("Pump flow rate must be positive"),
  volumeLiters: z.coerce.number().positive("Calculated volume must be positive"),
  notes: z.string().optional().nullable(),
});

export type WaterLogInput = z.infer<typeof waterLogSchema>;

export const pesticideLogSchema = z.object({
  fieldId: z.string().min(1, "Please select a field"),
  date: z.string().min(1, "Date is required"),
  chemicalName: z.string().min(1, "Chemical name is required"),
  targetPest: z.string().min(1, "Target pest or disease is required"),
  formulationType: z.enum(["LIQUID", "DRY_POWDER"], {
    errorMap: () => ({ message: "Select Liquid or Dry Powder" }),
  }),
  dosageRate: z.coerce.number().positive("Dosage rate must be greater than 0"),
  dosageUnit: z.enum(["ML_PER_L", "L_PER_L", "G_PER_L", "KG_PER_L"], {
    errorMap: () => ({ message: "Select a valid SI dosage unit" }),
  }),
  sprayVolumeLiters: z.coerce.number().positive("Total spray volume must be greater than 0"),
  netChemicalAmount: z.coerce.number().positive("Computed net chemical amount must be greater than 0"),
  netChemicalUnit: z.string().min(1, "Unit required"),
  applicationMethod: z.enum(["FOLIAR", "DRENCH", "FERTIGATION", "TRACTOR", "TRACTOR_SPRAY"], {
    errorMap: () => ({ message: "Select application method" }),
  }),
});

export type PesticideLogInput = z.infer<typeof pesticideLogSchema>;

export const pesticideBatchItemSchema = z.object({
  chemicalName: z.string().min(1, "Chemical name is required"),
  targetPest: z.string().min(1, "Target pest or disease is required"),
  formulationType: z.enum(["LIQUID", "DRY_POWDER"], {
    errorMap: () => ({ message: "Select Liquid or Dry Powder" }),
  }),
  dosageRate: z.coerce.number().positive("Dosage rate must be greater than 0"),
  dosageUnit: z.enum(["ML_PER_L", "L_PER_L", "G_PER_L", "KG_PER_L"], {
    errorMap: () => ({ message: "Select a valid SI dosage unit" }),
  }),
});

export const pesticideBatchSchema = z.object({
  fieldId: z.string().min(1, "Please select a field"),
  date: z.string().min(1, "Date is required"),
  sprayVolumeLiters: z.coerce.number().positive("Total spray volume must be greater than 0"),
  applicationMethod: z.enum(["FOLIAR", "DRENCH", "FERTIGATION", "TRACTOR", "TRACTOR_SPRAY"], {
    errorMap: () => ({ message: "Select application method" }),
  }),
  chemicals: z.array(pesticideBatchItemSchema).min(1, "At least one chemical is required in the tank mix"),
});

export type PesticideBatchItem = z.infer<typeof pesticideBatchItemSchema>;
export type PesticideBatchInput = z.infer<typeof pesticideBatchSchema>;

export const dailyExpenseSchema = z.object({
  fieldId: z.string().optional().nullable(),
  date: z.string().min(1, "Date is required"),
  category: z.enum(["LABOUR", "PESTICIDES", "FUEL", "MAINTENANCE", "OTHER"], {
    errorMap: () => ({ message: "Select a valid category" }),
  }),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  quantity: z.coerce.number().optional().nullable(),
  unitRate: z.coerce.number().optional().nullable(),
  description: z.string().min(2, "Description is required"),
});

export type DailyExpenseInput = z.infer<typeof dailyExpenseSchema>;
