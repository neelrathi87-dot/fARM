"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sprout,
  Receipt,
  LayoutDashboard,
  PlusCircle,
  Calendar,
  Smartphone,
  Download,
} from "lucide-react";
import { useFarmStore } from "@/lib/store/farmStore";
import { Button } from "@/components/ui/Button";
import { AppDownloadModal } from "./AppDownloadModal";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { openModal } = useFarmStore();
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Plot Hub & Calendar", href: "/fields", icon: Calendar },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-farm-700 to-farm-500 flex items-center justify-center text-white shadow-md shadow-farm-600/30 group-hover:scale-105 transition-transform">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1">
                    Farm<span className="text-farm-600">Pulse</span>
                  </span>
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-600 -mt-1">
                    Ops & Water Intelligence
                  </span>
                </div>
              </Link>

              {/* Nav Links (Cleaned: Overview + Plot Hub & Calendar) */}
              <nav className="hidden sm:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-farm-50 text-farm-700 font-bold border border-farm-200/60 shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          isActive ? "text-farm-600" : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Actions & App Download Module */}
            <div className="flex items-center gap-2">
              {/* App Download Module Trigger */}
              <button
                type="button"
                onClick={() => setDownloadModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer group"
                title="Download Mobile & Desktop App"
              >
                <Smartphone className="h-3.5 w-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Download App</span>
                <span className="hidden md:inline text-[9px] font-extrabold px-1.5 py-0.2 bg-emerald-600 text-white rounded-full">
                  APK/PWA
                </span>
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal("EXPENSE")}
                className="text-xs text-amber-700 hover:bg-amber-50 hover:border-amber-300 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Receipt className="h-3.5 w-3.5 text-amber-600" />
                <span>Overall Expense</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => openModal("FIELD")}
                className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>New Plot</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </>
  );
};
