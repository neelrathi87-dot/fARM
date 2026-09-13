import React from "react";
import { getFields } from "@/actions/fields";
import { getWaterLogs, getIrrigationStats } from "@/actions/irrigation";
import { IrrigationView } from "@/components/irrigation/IrrigationView";

export const revalidate = 0;

export default async function IrrigationPage() {
  const fields = await getFields();
  const logs = await getWaterLogs();
  const stats = await getIrrigationStats();

  return <IrrigationView fields={fields} initialLogs={logs} initialStats={stats} />;
}
