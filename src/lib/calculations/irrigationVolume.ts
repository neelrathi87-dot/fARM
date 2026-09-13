export type WaterType = "NORMAL_WATER" | "LIQUID_WATER";
export type DeliveryMethod = "DRIP" | "SPRINKLER" | "FLOOD";

export interface MotorPreset {
  hp: number;
  label: string;
  defaultFlowRateLpm: number; // Liters per minute
}

export const MOTOR_PRESETS: MotorPreset[] = [
  { hp: 3.0, label: "3.0 HP Submersible (~450 L/min)", defaultFlowRateLpm: 450 },
  { hp: 5.0, label: "5.0 HP Standard Borewell (~750 L/min)", defaultFlowRateLpm: 750 },
  { hp: 7.5, label: "7.5 HP High-Discharge Pump (~1,125 L/min)", defaultFlowRateLpm: 1125 },
  { hp: 10.0, label: "10.0 HP Canal / Deep Borewell (~1,500 L/min)", defaultFlowRateLpm: 1500 },
  { hp: 15.0, label: "15.0 HP Heavy Agricultural Station (~2,250 L/min)", defaultFlowRateLpm: 2250 },
];

/**
 * Calculates duration in minutes from start and end time strings (HH:mm format).
 * Gracefully handles overnight running (e.g. 23:00 to 02:30).
 */
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
    return 0;
  }

  const startTotalMinutes = startHours * 60 + startMinutes;
  let endTotalMinutes = endHours * 60 + endMinutes;

  // Overnight transition (e.g. 22:00 to 04:00)
  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }

  return Math.max(0, endTotalMinutes - startTotalMinutes);
}

/**
 * Calculates total irrigation flow volume in liters based on duration and pump flow rate.
 */
export function calculateIrrigationVolume(durationMinutes: number, flowRateLpm: number): number {
  if (isNaN(durationMinutes) || durationMinutes <= 0 || isNaN(flowRateLpm) || flowRateLpm <= 0) {
    return 0;
  }
  return Math.round(durationMinutes * flowRateLpm);
}

/**
 * Formats minutes into human-readable hours and minutes (e.g., 145 min -> "2h 25m").
 */
export function formatDuration(durationMinutes: number): string {
  if (durationMinutes <= 0) return "0m";
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Formats water volume strictly in Liters (L) and Milliliters (mL).
 */
export function formatVolume(liters: number): string {
  if (isNaN(liters) || liters <= 0) return "0 Liters (0 mL)";
  if (liters < 1.0) {
    const ml = Math.round(liters * 1000);
    return `${ml.toLocaleString()} mL (${liters.toFixed(3)} L)`;
  }
  const ml = Math.round(liters * 1000);
  return `${liters.toLocaleString()} Liters (${ml.toLocaleString()} mL)`;
}
