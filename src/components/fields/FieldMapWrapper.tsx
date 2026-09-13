"use client";

import dynamic from "next/dynamic";
import React from "react";

const DynamicFieldMap = dynamic(() => import("./FieldMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 text-xs border border-slate-200">
      <div className="h-8 w-8 border-3 border-farm-500 border-t-transparent rounded-full animate-spin mb-2" />
      <span>Rendering Geospatial Map Tiles...</span>
    </div>
  ),
});

export const FieldMapWrapper: React.FC<React.ComponentProps<typeof DynamicFieldMap>> = (props) => {
  return <DynamicFieldMap {...props} />;
};

export default FieldMapWrapper;
