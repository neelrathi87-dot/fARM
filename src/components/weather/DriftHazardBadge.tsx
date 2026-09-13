import React from "react";
import { DriftHazardAssessment } from "@/lib/weather/openMeteo";
import { CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

interface DriftHazardBadgeProps {
  assessment: DriftHazardAssessment;
  size?: "sm" | "md" | "lg";
}

export const DriftHazardBadge: React.FC<DriftHazardBadgeProps> = ({
  assessment,
  size = "md",
}) => {
  const Icon =
    assessment.level === "SAFE"
      ? CheckCircle2
      : assessment.level === "CAUTION"
      ? AlertTriangle
      : ShieldAlert;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
    lg: "px-4 py-2 text-sm gap-2",
  };

  return (
    <div
      className={`inline-flex items-center font-bold rounded-lg border ${assessment.bgClass} ${assessment.borderClass} ${assessment.colorClass} ${sizeClasses[size]}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{assessment.badgeText}</span>
    </div>
  );
};
