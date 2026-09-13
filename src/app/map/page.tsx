import React from "react";
import { getFields } from "@/actions/fields";
import { MapView } from "@/components/map/MapView";

export const revalidate = 0;

export default async function MapPage() {
  const fields = await getFields();
  return <MapView fields={fields} />;
}
