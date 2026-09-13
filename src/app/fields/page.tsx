import React from "react";
import { getFieldsWithFullHistory } from "@/actions/fields";
import { FieldManagerView } from "@/components/fields/FieldManagerView";

export const revalidate = 0;

export default async function FieldsPage() {
  const fields = await getFieldsWithFullHistory();
  return <FieldManagerView initialFields={fields} />;
}
