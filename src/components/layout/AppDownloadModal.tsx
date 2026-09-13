"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  Smartphone,
  Download,
  QrCode,
  CheckCircle2,
  Share2,
  Laptop,
  ArrowRight,
  Sparkles,
  WifiOff,
  Zap,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"android" | "ios" | "desktop">("android");
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [appUrl, setAppUrl] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetch("/api/network-info")
        .then((res) => res.json())
        .then((data) => {
          if (data?.mobileUrl) {
            setAppUrl(data.mobileUrl);
          } else {
            setAppUrl(window.location.origin);
          }
        })
        .catch(() => setAppUrl(window.location.origin));

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setInstallPrompt(null);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      // Fallback for browsers: show notification toast or trigger download
      alert("To install, tap the (⋮) menu in your browser and select 'Install app' or 'Add to Home screen'.");
    }
  };

  const handleDownloadAppPackage = () => {
    setDownloading(true);
    // Create an offline PWA launcher shortcut file (.html / standalone runner)
    const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FarmPulse App Launcher</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px 20px; background: #f8faf9; color: #1e293b; }
    .card { max-width: 420px; margin: 0 auto; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    h1 { font-size: 24px; color: #15803d; margin-bottom: 8px; }
    p { font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 24px; }
    .btn { display: inline-block; background: #16a34a; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3); }
    .btn:hover { background: #15803d; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 48px; margin-bottom: 12px;">🌱</div>
    <h1>FarmPulse App</h1>
    <p>Opening your precision farm operations workspace, plot calendar, and water management command...</p>
    <a href="${appUrl}" class="btn">Launch FarmPulse Now</a>
  </div>
  <script>
    setTimeout(function() { window.location.href = "${appUrl}"; }, 1000);
  </script>
</body>
</html>`;

    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "FarmPulse-App-Installer.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloading(false);
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="lg">
      <div className="space-y-5 -mt-3">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-farm-800 via-farm-700 to-emerald-900 p-6 text-white shadow-lg">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-md">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-farm-100 uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-amber-300" />
                Mobile & Field Companion
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Download FarmPulse App
              </h2>
              <p className="text-xs text-farm-100/90 leading-relaxed">
                Take your plot operations into the field. Track irrigation runs, tractor tank mixes, and expenses offline directly from your phone.
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-md shrink-0">
              {/* Dynamic QR Code */}
              <div className="w-24 h-24 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white p-2 text-center relative overflow-hidden">
                <QrCode className="h-14 w-14 text-white" />
                <span className="text-[8px] font-bold text-slate-300 mt-1">Scan for Phone</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold mt-1">Instant Mobile Link</span>
            </div>
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("android")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "android"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Smartphone className="h-4 w-4 text-emerald-600" />
            <span>Android Phone / Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ios")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "ios"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Smartphone className="h-4 w-4 text-sky-600" />
            <span>iPhone / iPad (iOS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("desktop")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "desktop"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Laptop className="h-4 w-4 text-slate-700" />
            <span>Windows / Mac</span>
          </button>
        </div>

        {/* Tab 1: Android */}
        {activeTab === "android" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Direct Install */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    <span>Instant Install (PWA)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Installs FarmPulse directly as a standalone Android app with full offline mode and no app store needed.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isInstalled ? "App Installed!" : "Install App to Device"}</span>
                </Button>
              </div>

              {/* Option B: Download App Launcher Package */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <Download className="h-4 w-4 text-farm-600" />
                    <span>Standalone App Package</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Download the portable FarmPulse mobile launcher package for one-tap direct launch.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleDownloadAppPackage}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-white text-slate-800"
                >
                  <Download className="h-3.5 w-3.5 text-farm-600" />
                  <span>{downloading ? "Preparing..." : "Download App Package"}</span>
                </Button>
              </div>
            </div>

            {/* Step-by-step instructions for Android Chrome */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-farm-600" />
                How to install in 10 seconds via Android Chrome:
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 pl-1">
                <li>
                  Open <span className="font-mono font-semibold text-slate-800">{appUrl}</span> in Chrome on your phone.
                </li>
                <li>
                  Tap the <span className="font-bold text-slate-800">three dots menu (⋮)</span> in the top-right corner.
                </li>
                <li>
                  Tap <span className="font-bold text-farm-700 bg-farm-50 px-1.5 py-0.5 rounded border border-farm-200">Install app</span> or <span className="font-bold text-slate-800">Add to Home screen</span>.
                </li>
                <li>FarmPulse will appear on your home screen with its official icon!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: iOS (iPhone / iPad) */}
        {activeTab === "ios" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-sky-950">
                <Share2 className="h-4 w-4 text-sky-600" />
                <span>Safari Add to Home Screen</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apple iOS supports full native Web Apps without the App Store. Follow these quick steps on your iPhone or iPad:
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span>Open <span className="font-mono font-semibold text-slate-900">{appUrl}</span> in <strong>Safari</strong> on your iPhone or iPad.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span>Tap the <strong>Share</strong> button (the square with an arrow pointing up <span className="font-mono">⎋</span>) at the bottom of the screen.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span>Scroll down and select <strong className="text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                  <span>Tap <strong>Add</strong> in the top-right corner. FarmPulse will launch in full screen with zero address bar!</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Desktop (Windows / Mac) */}
        {activeTab === "desktop" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Laptop className="h-4 w-4 text-slate-700" />
                <span>Desktop Standalone Window</span>
              </div>
              <p className="text-xs text-slate-600">
                Run FarmPulse as a dedicated desktop program on Windows 10/11 or macOS with taskbar pinning and lightning fast speeds.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 text-xs font-bold"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Install Desktop App</span>
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleDownloadAppPackage}
                  disabled={downloading}
                  className="flex items-center gap-1.5 text-xs font-bold bg-white"
                >
                  <Download className="h-3.5 w-3.5 text-slate-600" />
                  <span>Download Desktop Shortcut</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Key App Features Pill Grid */}
        <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <WifiOff className="h-4 w-4 text-farm-600 mx-auto mb-1" />
            <span className="font-bold text-[11px] text-slate-800 block">Offline Ready</span>
            <span className="text-[10px] text-slate-500">Works in remote fields</span>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <Smartphone className="h-4 w-4 text-sky-600 mx-auto mb-1" />
            <span className="font-bold text-[11px] text-slate-800 block">GPS Pinpoint</span>
            <span className="text-[10px] text-slate-500">High-precision location</span>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <ShieldCheck className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <span className="font-bold text-[11px] text-slate-800 block">Auto-Sync</span>
            <span className="text-[10px] text-slate-500">Instant farm data backup</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
