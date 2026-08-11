"use client";

import React, { useState } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { useStore } from "@/lib/context/StoreContext";
import { Density, ThemeMode } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export default function AppearanceSettingsPage() {
  const { appearance, updateAppearance } = useStore();
  const [saved, setSaved] = useState(false);

  // Applied live on click so the choice is previewed immediately; the store
  // write also persists it, so "Save" is really just the confirmation.
  const theme = appearance.theme;
  const density = appearance.density;
  const setTheme = (next: ThemeMode) => updateAppearance({ theme: next });
  const setDensity = (next: Density) => updateAppearance({ density: next });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppearance({ theme, density });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-base font-bold text-neutral-900">Appearance & Display</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Customize your dashboard interface theme and table density.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Theme Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Interface Theme
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-4 rounded-2xl border text-left flex items-start justify-between transition ${
                theme === "light"
                  ? "border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900"
                  : "border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <div className="space-y-1">
                <Sun className="h-5 w-5 text-neutral-700" />
                <div className="text-xs font-bold text-neutral-900 pt-1">Light Mode</div>
                <div className="text-[11px] text-neutral-500">Crisp high-contrast light canvas</div>
              </div>
              {theme === "light" && <Check className="h-4 w-4 text-neutral-900" />}
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-2xl border text-left flex items-start justify-between transition ${
                theme === "dark"
                  ? "border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900"
                  : "border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <div className="space-y-1">
                <Moon className="h-5 w-5 text-neutral-700" />
                <div className="text-xs font-bold text-neutral-900 pt-1">Dark Mode</div>
                <div className="text-[11px] text-neutral-500">Subdued low-light dark surfaces</div>
              </div>
              {theme === "dark" && <Check className="h-4 w-4 text-neutral-900" />}
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`p-4 rounded-2xl border text-left flex items-start justify-between transition ${
                theme === "system"
                  ? "border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900"
                  : "border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <div className="space-y-1">
                <Laptop className="h-5 w-5 text-neutral-700" />
                <div className="text-xs font-bold text-neutral-900 pt-1">System Preference</div>
                <div className="text-[11px] text-neutral-500">Sync with your OS setting</div>
              </div>
              {theme === "system" && <Check className="h-4 w-4 text-neutral-900" />}
            </button>
          </div>
        </div>

        {/* Density Selector */}
        <div className="space-y-3 pt-4 border-t border-neutral-100">
          <label className="block text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Table & List Density
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDensity("comfortable")}
              className={`p-4 rounded-xl border text-left flex items-start justify-between transition ${
                density === "comfortable"
                  ? "border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900"
                  : "border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <div>
                <div className="text-xs font-bold text-neutral-900">Comfortable (Default)</div>
                <div className="text-[11px] text-neutral-500">Spacious padding and readable row heights</div>
              </div>
              {density === "comfortable" && <Check className="h-4 w-4 text-neutral-900" />}
            </button>

            <button
              type="button"
              onClick={() => setDensity("compact")}
              className={`p-4 rounded-xl border text-left flex items-start justify-between transition ${
                density === "compact"
                  ? "border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900"
                  : "border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <div>
                <div className="text-xs font-bold text-neutral-900">Compact High-Density</div>
                <div className="text-[11px] text-neutral-500">Tight spacing to display maximum orders on screen</div>
              </div>
              {density === "compact" && <Check className="h-4 w-4 text-neutral-900" />}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          <Button type="submit" size="md" variant="primary">
            {saved ? "Appearance Saved!" : "Save Settings"}
          </Button>

          {saved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="h-4 w-4" /> Appearance preferences saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
