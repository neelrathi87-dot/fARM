import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Navbar } from "@/components/layout/Navbar";
import { GlobalStatusBar } from "@/components/layout/GlobalStatusBar";
import { GlobalModalHost } from "@/components/layout/GlobalModalHost";
import { getFields } from "@/actions/fields";

export const metadata: Metadata = {
  title: "FarmPulse | Precision Farm Operations & Water Intelligence",
  description:
    "End-to-end farm operations, dual-water irrigation engine, SI chemical dosage calculations, Open-Meteo agricultural drift telemetry, and operational burn-rate platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fields = await getFields();

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FarmPulse" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F8FAF9] text-slate-900 antialiased selection:bg-farm-200">
        <Navbar />
        <GlobalStatusBar fields={fields} />
        <GlobalModalHost fields={fields} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-slate-700">
              FarmPulse Ops Engine v1.0.0
            </span>
            <span>
              Agricultural Telemetry powered by Open-Meteo • Precision SI Formulation & Water Resource Platform
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
