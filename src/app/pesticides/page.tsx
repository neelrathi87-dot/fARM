import React from "react";
import { getFields } from "@/actions/fields";
import { getPesticideLogs } from "@/actions/pesticides";
import { PesticidesView } from "@/components/pesticides/PesticidesView";

export const revalidate = 0;

export default async function PesticidesPage() {
  const fields = await getFields();
  const logs = await getPesticideLogs();

  return <PesticidesView fields={fields} initialLogs={logs} />;
}
