import React from "react";
import { getFields } from "@/actions/fields";
import { getWaterLogs, getIrrigationStats } from "@/actions/irrigation";
import { getPesticideLogs } from "@/actions/pesticides";
import { getExpenses, getExpenseAnalytics } from "@/actions/expenses";
import { FieldMapWrapper } from "@/components/fields/FieldMapWrapper";
import { DashboardPlotSection } from "@/components/dashboard/DashboardPlotSection";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { formatVolume } from "@/lib/calculations/irrigationVolume";
import {
  Sprout,
  Droplets,
  FlaskConical,
  Receipt,
  TrendingUp,
  MapPin,
  Clock,
  Bug,
  ShieldCheck,
  Compass,
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Dynamic data

export default async function DashboardPage() {
  const fields = await getFields();
  const irrigationStats = await getIrrigationStats();
  const expenseAnalytics = await getExpenseAnalytics();
  const recentWaterLogs = (await getWaterLogs()).slice(0, 4);
  const recentPesticides = (await getPesticideLogs()).slice(0, 4);
  const recentExpenses = (await getExpenses()).slice(0, 4);

  const totalAcres = fields.reduce((sum, f) => sum + f.areaAcres, 0);
  const primaryField = fields[0] || {
    latitude: 18.5204,
    longitude: 73.8567,
    name: "Farm Operations Base (Pune)",
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Farm Operations Command
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry, dual-water allocation balance, SI chemical dosing, and burn-rate intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/fields"
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Compass className="h-3.5 w-3.5 text-farm-600" />
            Manage Plots ({fields.length})
          </Link>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Acreage & Plots */}
        <Card className="border-l-4 border-l-farm-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cultivated Estate
              </span>
              <div className="p-2 bg-farm-50 rounded-lg text-farm-600">
                <Sprout className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
              {totalAcres.toFixed(1)} <span className="text-sm font-semibold text-slate-500">Acres</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-farm-700">{fields.length} Active Plots</span>
              <span>• Multi-crop rotation</span>
            </div>
          </CardContent>
        </Card>

        {/* Dual-Water Discharged */}
        <Card className="border-l-4 border-l-water-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Irrigation Discharged
              </span>
              <div className="p-2 bg-water-50 rounded-lg text-water-600">
                <Droplets className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
              {formatVolume(irrigationStats.totalLiters)}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="text-water-700 font-semibold">
                {irrigationStats.normalWaterLiters.toLocaleString()} L Normal
              </span>
              <span>/</span>
              <span className="text-emerald-700 font-semibold">
                {irrigationStats.liquidWaterLiters.toLocaleString()} L Liquid
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Chemical Treatments */}
        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Spray Operations
              </span>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <FlaskConical className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
              {recentPesticides.length}+ <span className="text-sm font-semibold text-slate-500">Events</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-700 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              SI Normalized Formulations
            </div>
          </CardContent>
        </Card>

        {/* Financial Burn Rate */}
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Monthly Burn Rate
              </span>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
              {formatCurrency(expenseAnalytics.currentMonthSpend)}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
              <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
              <span>Proj: {formatCurrency(expenseAnalytics.projectedMonthlyBurn)}/mo</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map & Live Weather Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm Active Plot Operations Hub (2 columns) */}
        <div className="lg:col-span-2">
          <DashboardPlotSection fields={fields} primaryField={primaryField} />
        </div>

        {/* Live Weather & Drift Hazard Telemetry Widget (1 column) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-sky-600" />
              Live Weather & Spray Hazard
            </h3>
            <span className="text-[11px] text-sky-700 font-semibold px-1.5 py-0.5 bg-sky-50 rounded border border-sky-200">
              OpenWeather API
            </span>
          </div>
          <WeatherWidget
            latitude={primaryField.latitude}
            longitude={primaryField.longitude}
            locationName={primaryField.name}
          />
        </div>
      </div>

      {/* Recent Activity Streams: 3-column split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Irrigation */}
        <Card>
          <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-water-600" />
              Recent Water Runs
            </CardTitle>
            <Link
              href="/irrigation"
              className="text-xs text-farm-600 font-semibold hover:underline"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            {recentWaterLogs.length === 0 ? (
              <p className="text-slate-400">No irrigation runs logged.</p>
            ) : (
              recentWaterLogs.map((w) => (
                <div
                  key={w.id}
                  className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{w.field.name}</span>
                    <span className="font-mono text-water-700">
                      {formatVolume(w.volumeLiters)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {w.startTime} - {w.endTime}
                    </span>
                    <Badge
                      variant={w.waterType === "NORMAL_WATER" ? "water" : "farm"}
                      size="sm"
                    >
                      {w.waterType === "NORMAL_WATER" ? "Normal" : "Liquid Slurry"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Pesticide Treatments */}
        <Card>
          <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-emerald-600" />
              Recent Chemical Sprays
            </CardTitle>
            <Link
              href="/pesticides"
              className="text-xs text-farm-600 font-semibold hover:underline"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            {recentPesticides.length === 0 ? (
              <p className="text-slate-400">No chemical sprays logged.</p>
            ) : (
              recentPesticides.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{p.chemicalName}</span>
                    <span className="font-mono text-emerald-700 font-extrabold">
                      {p.netChemicalAmount} {p.netChemicalUnit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-rose-600 font-medium">
                      <Bug className="h-3 w-3" />
                      {p.targetPest}
                    </span>
                    <span>{p.field.name}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Operational Expenses */}
        <Card>
          <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-amber-600" />
              Operational Spend
            </CardTitle>
            <Link
              href="/expenses"
              className="text-xs text-farm-600 font-semibold hover:underline"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            {recentExpenses.length === 0 ? (
              <p className="text-slate-400">No expenses logged.</p>
            ) : (
              recentExpenses.map((e) => (
                <div
                  key={e.id}
                  className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="truncate max-w-[170px]">{e.description}</span>
                    <span className="font-mono text-slate-900 font-extrabold">
                      {formatCurrency(e.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-amber-700">{e.category}</span>
                    <span>{formatDate(e.date)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
